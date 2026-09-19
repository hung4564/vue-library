import { FallbackResolver } from '@hungpvq/map-core';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { MapGeoJSONFeature } from 'maplibre-gl';
import { toFeature, type DataRecord } from '../data-management';
import { getDatasetFeatureCollection } from '../geo-export/dataset';
import { GEOJSON_FEATURE_ID_KEY } from '../geojson/feature-id';
import { findGeojsonSource } from '../geojson/find-source';
import type { IDataset } from '../interfaces/dataset.base';
import type {
  IdentifyResolveFeatureQuery,
  IIdentifyView,
  IMapboxSourceView,
} from '../interfaces/dataset.parts';
import { asFeatureCollection } from '../utils/feature-collection';

/**
 * Ids to match a MapLibre-queried feature against source GeoJSON.
 * Prefer config field_id / `_id` — skip using coordinates (zoom-skewed).
 */
export function identifyRenderedFeatureMatchIds(
  feature: MapGeoJSONFeature,
  fieldId = 'id',
): string[] {
  const props = (feature.properties ?? {}) as Record<string, unknown>;
  const out: string[] = [];
  const push = (value: unknown) => {
    if (value == null || String(value) === '') return;
    out.push(String(value));
  };
  push(props[fieldId]);
  push(props[GEOJSON_FEATURE_ID_KEY]);
  push(feature.id);
  if (fieldId !== 'id') push(props['id']);
  return [...new Set(out)];
}

/** Find a Feature in a collection by any of the candidate id strings. */
export function findSourceFeatureByMatchIds(
  collection: FeatureCollection,
  ids: string[],
  fieldId = 'id',
): Feature | undefined {
  if (!ids.length) return undefined;
  const idSet = new Set(ids);
  for (const feature of collection.features) {
    const props = (feature.properties ?? {}) as Record<string, unknown>;
    const keys = [
      props[fieldId],
      props[GEOJSON_FEATURE_ID_KEY],
      feature.id,
      props['id'],
    ];
    if (keys.some((key) => key != null && idSet.has(String(key)))) {
      return feature;
    }
  }
  return undefined;
}

/**
 * Flat Identify row payload. Prefer resolved Feature geometry so fitBounds /
 * Detail / highlight are not skewed by MapLibre `queryRenderedFeatures`.
 */
export function flattenIdentifyFeatureData(
  rendered: MapGeoJSONFeature,
  resolved?: Feature | null,
): Record<string, unknown> {
  const renderedProps = (rendered.properties ?? {}) as Record<string, unknown>;
  if (!resolved?.geometry) {
    return {
      ...renderedProps,
      geometry: rendered.geometry,
    };
  }
  const sourceProps = (resolved.properties ?? {}) as Record<string, unknown>;
  return {
    ...renderedProps,
    ...sourceProps,
    geometry: resolved.geometry,
  };
}

/** Sync: read in-memory GeoJSON source data for an Identify node (if any). */
export function getIdentifySourceFeatureCollectionSync(
  identify: IDataset,
): FeatureCollection | null {
  const source = findGeojsonSource(identify);
  if (!source) return null;
  const data = source.getData?.() ?? source.getMapboxSource?.()?.data;
  return asFeatureCollection(data);
}

/** Coerce enrichment slot to a Feature with real geometry. */
export function coerceIdentifyResolvedFeature(
  result: unknown,
): Feature | null {
  if (result == null) return null;
  if (
    typeof result === 'object' &&
    (result as Feature).type === 'Feature' &&
    (result as Feature).geometry
  ) {
    return result as Feature;
  }
  const record = result as DataRecord;
  if (!record.geometry) return null;
  return toFeature(record) ?? null;
}

export function renderedToIdentifyFeature(
  rendered: MapGeoJSONFeature,
): Feature {
  return {
    type: 'Feature',
    id: rendered.id,
    properties: { ...(rendered.properties ?? {}) },
    geometry: rendered.geometry as Geometry,
  };
}

function asIdentifyView(identify: IDataset): IIdentifyView {
  return identify as IIdentifyView;
}

function normalizeGetFeatureResult(
  result: unknown,
  count: number,
): (Feature | null)[] {
  if (result == null) {
    return Array.from({ length: count }, () => null);
  }
  if (Array.isArray(result)) {
    return Array.from({ length: count }, (_, i) =>
      coerceIdentifyResolvedFeature(result[i]),
    );
  }
  const one = coerceIdentifyResolvedFeature(result);
  if (count === 1) return [one];
  return Array.from({ length: count }, () => null);
}

function buildGetFeatureQuery(
  rendered: MapGeoJSONFeature[],
  ids: Array<string | number>,
  source: IMapboxSourceView | null | undefined,
): IdentifyResolveFeatureQuery {
  if (rendered.length === 1) {
    return {
      feature: rendered[0],
      source,
      id: ids[0] ?? '',
    };
  }
  return {
    features: rendered,
    source,
    ids,
  };
}

export type IdentifyFeatureResolveContext = {
  identify: IDataset;
  rendered: MapGeoJSONFeature[];
  fieldId: string;
  source?: IMapboxSourceView | null;
  collection?: FeatureCollection | null;
  ids: Array<string | number>;
  /** Parallel resolved Features (null slots still open). */
  slots: (Feature | null)[];
  /** Final Feature[] after resolve (set when complete). */
  features: Feature[];
};

function slotNeedsGeometry(slot: Feature | null): boolean {
  return !slot?.geometry;
}

/**
 * Identify geometry resolve chain:
 * 1. Identify `getFeature` → always `Feature[]` (single: `{ feature, id }`, multi: `{ features, ids }`)
 * 2. GeoJSON source by id
 * 3. MapLibre rendered geometry
 */
export function createIdentifyFeatureResolver() {
  return new FallbackResolver<IdentifyFeatureResolveContext>([
    {
      priority: 30,
      always: true,
      when: (ctx) =>
        !!asIdentifyView(ctx.identify).getFeature &&
        ctx.slots.some(slotNeedsGeometry),
      execute: async (ctx) => {
        const getFeature = asIdentifyView(ctx.identify).getFeature!;
        const result = await getFeature(
          buildGetFeatureQuery(ctx.rendered, ctx.ids, ctx.source),
        );
        if (result == null) return;
        const normalized = normalizeGetFeatureResult(
          result,
          ctx.rendered.length,
        );
        if (!normalized.some((f) => f?.geometry)) return;
        // Mutate slots in place — FallbackResolver shallow-copies context.
        for (let i = 0; i < ctx.slots.length; i++) {
          if (slotNeedsGeometry(ctx.slots[i]) && normalized[i]?.geometry) {
            ctx.slots[i] = normalized[i];
          }
        }
      },
    },
    {
      priority: 20,
      always: true,
      when: (ctx) =>
        !!ctx.collection && ctx.slots.some(slotNeedsGeometry),
      execute: (ctx) => {
        const collection = ctx.collection!;
        for (let i = 0; i < ctx.slots.length; i++) {
          if (!slotNeedsGeometry(ctx.slots[i])) continue;
          const matchIds = identifyRenderedFeatureMatchIds(
            ctx.rendered[i],
            ctx.fieldId,
          );
          const fromSource = findSourceFeatureByMatchIds(
            collection,
            matchIds,
            ctx.fieldId,
          );
          if (fromSource?.geometry) {
            ctx.slots[i] = fromSource;
          }
        }
      },
    },
    {
      priority: 10,
      always: true,
      when: (ctx) => ctx.slots.some(slotNeedsGeometry),
      execute: (ctx) => {
        for (let i = 0; i < ctx.slots.length; i++) {
          if (slotNeedsGeometry(ctx.slots[i])) {
            ctx.slots[i] = renderedToIdentifyFeature(ctx.rendered[i]);
          }
        }
      },
    },
  ]).setPrepare(async (ctx) => {
    const source = findGeojsonSource(ctx.identify);
    let collection = getIdentifySourceFeatureCollectionSync(ctx.identify);
    if (!collection) {
      try {
        collection = await getDatasetFeatureCollection(ctx.identify);
      } catch {
        collection = null;
      }
    }
    return { source, collection };
  });
}

const defaultIdentifyFeatureResolver = createIdentifyFeatureResolver();

/**
 * Resolve MapLibre hits to GeoJSON `Feature[]` (parallel to `rendered`).
 * Chain: Identify.getFeature → source → rendered geometry.
 */
export async function resolveIdentifyFeatures(
  identify: IDataset,
  rendered: MapGeoJSONFeature[],
  fieldId?: string,
): Promise<Feature[]> {
  if (rendered.length === 0) return [];

  const resolvedFieldId =
    fieldId ??
    (identify as { config?: { field_id?: string } }).config?.field_id ??
    'id';
  const ids = rendered.map(
    (feature) =>
      identifyRenderedFeatureMatchIds(feature, resolvedFieldId)[0] ?? '',
  );

  const ctx: IdentifyFeatureResolveContext = {
    identify,
    rendered,
    fieldId: resolvedFieldId,
    ids,
    slots: Array.from({ length: rendered.length }, () => null),
    features: [],
  };

  const result = await defaultIdentifyFeatureResolver.execute(ctx);
  const slots = result.context.slots.map((slot, i) =>
    slot?.geometry ? slot : renderedToIdentifyFeature(rendered[i]),
  );
  result.context.features = slots as Feature[];
  return result.context.features;
}

/**
 * Resolve one hit to a flat Identify `data` record (props + geometry).
 */
export async function resolveIdentifyFeatureData(
  identify: IDataset,
  rendered: MapGeoJSONFeature,
  options?: {
    fieldId?: string;
  },
): Promise<Record<string, unknown>> {
  const [feature] = await resolveIdentifyFeatures(
    identify,
    [rendered],
    options?.fieldId,
  );
  return flattenIdentifyFeatureData(rendered, feature);
}

/**
 * Resolve many hits to flat Identify `data` records.
 */
export async function resolveIdentifyFeaturesData(
  identify: IDataset,
  rendered: MapGeoJSONFeature[],
  fieldId?: string,
): Promise<Record<string, unknown>[]> {
  const features = await resolveIdentifyFeatures(
    identify,
    rendered,
    fieldId,
  );
  return rendered.map((hit, i) =>
    flattenIdentifyFeatureData(hit, features[i]),
  );
}
