import type { Feature, FeatureCollection } from 'geojson';
import type { FilterSpecification, GeoJSONFeature } from 'maplibre-gl';
import { loggerHighlight } from '../logger';
import {
  asFeatureCollection,
  isFeatureCollection,
} from '../utils/feature-collection';
import type { HighlightDataContext, HighlightDataSource, HighlightGeoJson } from './types';

function isFeature(value: unknown): value is Feature {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as Feature).type === 'Feature' &&
    !!(value as Feature).geometry
  );
}

export function normalizeToHighlightGeoJson(
  input: HighlightDataContext['input'],
): HighlightGeoJson | undefined {
  if (!input) return undefined;
  if (isFeatureCollection(input) || isFeature(input)) return input;
  if ('geometry' in input && input.geometry) {
    return {
      type: 'Feature',
      id: 'id' in input ? input.id : undefined,
      properties:
        'properties' in input && input.properties
          ? (input.properties as Feature['properties'])
          : {},
      geometry: input.geometry,
    };
  }
  return undefined;
}

function featuresToCollection(geojson: HighlightGeoJson): FeatureCollection {
  return (
    asFeatureCollection(geojson) ?? {
      type: 'FeatureCollection',
      features: [],
    }
  );
}

export function mergeEntriesToFeatureCollection(
  features: HighlightGeoJson[],
): FeatureCollection {
  const out: Feature[] = [];
  for (const item of features) {
    out.push(...featuresToCollection(item).features);
  }
  return { type: 'FeatureCollection', features: out };
}

/**
 * Resolve geometry for one highlight show.
 * P0: local. P1: vector-tile + resolver.
 */
export async function resolveHighlightData(
  data: HighlightDataSource,
  ctx: HighlightDataContext,
): Promise<HighlightGeoJson | null> {
  if (ctx.signal?.aborted) return null;

  if (data.type === 'local') {
    const geo = normalizeToHighlightGeoJson(ctx.input);
    if (!geo) {
      loggerHighlight
        .with({ fn: 'resolveHighlightData', span: 'highlight.resolve' })
        .warn('Local highlight skipped because geometry is missing.', {
        mapId: ctx.mapId,
      });
      return null;
    }
    return geo;
  }

  if (data.type === 'resolver') {
    try {
      const result = await data.resolve(ctx);
      if (ctx.signal?.aborted) return null;
      if (!result) return null;
      return result;
    } catch (err) {
      if (ctx.signal?.aborted) return null;
      loggerHighlight
        .with({ fn: 'resolveHighlightData', span: 'highlight.resolve' })
        .warn('Highlight data resolver failed.', { mapId: ctx.mapId, err });
      throw err;
    }
  }

  if (data.type === 'vector-tile') {
    const strategy = data.strategy ?? 'feature-state';
    if (strategy === 'query') {
      const sourceId = data.source;
      if (!sourceId) {
        loggerHighlight
          .with({ fn: 'resolveHighlightData', span: 'highlight.resolve' })
          .warn('Vector-tile highlight query skipped because source id is missing.', {
          mapId: ctx.mapId,
        });
        return null;
      }
      const id =
        ctx.input && 'id' in ctx.input ? ctx.input.id : undefined;
      try {
        const filter =
          id != null
            ? (['==', ['id'], id] as FilterSpecification)
            : undefined;
        const features = ctx.map.querySourceFeatures(sourceId, {
          sourceLayer: data.sourceLayer,
          filter,
        }) as GeoJSONFeature[];
        if (!features.length) return null;
        return {
          type: 'FeatureCollection',
          features: features as unknown as Feature[],
        };
      } catch (err) {
        loggerHighlight
          .with({ fn: 'resolveHighlightData', span: 'highlight.resolve' })
          .warn('Vector-tile highlight query failed.', { mapId: ctx.mapId, err });
        return null;
      }
    }
    // feature-state: return input as-is (ids); paint path applies state
    const geo = normalizeToHighlightGeoJson(ctx.input);
    if (!geo && ctx.input && 'id' in ctx.input) {
      return {
        type: 'Feature',
        id: ctx.input.id,
        properties: (ctx.input as { properties?: object }).properties ?? {},
        geometry: {
          type: 'Point',
          coordinates: [0, 0],
        },
      };
    }
    return geo ?? null;
  }

  return null;
}
