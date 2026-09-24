import type { MapGeoJSONFeature } from 'maplibre-gl';

import { GEOJSON_FEATURE_ID_KEY } from '../geojson/feature-id';
import type {
  IdentifyFeatureRow,
  IIdentifyView,
} from '../interfaces/dataset.parts';
import {
  flattenIdentifyFeatureData,
  identifyRenderedFeatureMatchIds,
  resolveIdentifyFeatures,
} from './source-geometry';

/** Resolve field_id from Identify config (default `id`). */
export function identifyConfigFieldId(
  identify: { config?: { field_id?: string } } | null | undefined,
): string {
  return identify?.config?.field_id || 'id';
}

export function identifyConfigFieldName(
  identify: { config?: { field_name?: string } } | null | undefined,
): string {
  return identify?.config?.field_name || 'name';
}

/**
 * Primary match id for a MapLibre hit — same order as
 * {@link identifyRenderedFeatureMatchIds}: field_id → `_id` → feature.id → `id`.
 */
export function primaryIdentifyFeatureId(
  feature: MapGeoJSONFeature,
  fieldId = 'id',
): string | undefined {
  return identifyRenderedFeatureMatchIds(feature, fieldId)[0];
}

/** Row id from already-flattened Identify `data` (same priority). */
export function primaryIdentifyRowId(
  data: Record<string, unknown>,
  fieldId = 'id',
  fallbackIndex = 0,
): string | number {
  const candidates = [data[fieldId], data[GEOJSON_FEATURE_ID_KEY], data['id']];
  for (const value of candidates) {
    if (value != null && String(value) !== '') {
      return value as string | number;
    }
  }
  return fallbackIndex;
}

/**
 * Keep first hit per primary id (fill / multi-layer duplicates).
 * Drops hits with no resolvable id.
 */
export function dedupeRenderedFeaturesById(
  features: MapGeoJSONFeature[],
  fieldId = 'id',
): MapGeoJSONFeature[] {
  const seen = new Set<string>();
  const out: MapGeoJSONFeature[] = [];
  for (const feature of features) {
    const id = primaryIdentifyFeatureId(feature, fieldId);
    if (id == null || id === '') continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(feature);
  }
  return out;
}

/** Build `{ id, name, data }` rows from flat resolved payloads. */
export function flatsToIdentifyFeatureRows(
  flats: Record<string, unknown>[],
  fieldId = 'id',
  fieldName = 'name',
): IdentifyFeatureRow[] {
  const seen = new Set<string>();
  const rows: IdentifyFeatureRow[] = [];
  for (const flat of flats) {
    const id = primaryIdentifyRowId(flat, fieldId, rows.length);
    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({
      id,
      name: String(flat[fieldName] ?? ''),
      data: flat,
    });
  }
  return rows;
}

/**
 * Shared Identify feature pipeline (single + merge):
 * dedupe by field_id/`_id` → getFeature → source → rendered → rows.
 */
export async function buildIdentifyFeatureRows(
  identify: IIdentifyView,
  rendered: MapGeoJSONFeature[],
): Promise<IdentifyFeatureRow[]> {
  const fieldId = identifyConfigFieldId(identify);
  const fieldName = identifyConfigFieldName(identify);
  const unique = dedupeRenderedFeaturesById(rendered, fieldId);
  if (!unique.length) return [];

  const features = await resolveIdentifyFeatures(identify, unique, fieldId);
  const flats = unique.map((hit, i) =>
    flattenIdentifyFeatureData(hit, features[i]),
  );
  return flatsToIdentifyFeatureRows(flats, fieldId, fieldName);
}
