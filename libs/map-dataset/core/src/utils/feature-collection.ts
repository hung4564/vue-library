import type { Feature, FeatureCollection, Geometry } from 'geojson';

import type { DataRecord } from '../data-management/types';

const GEOMETRY_TYPES = new Set([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection',
]);

export function isFeatureCollection(
  value: unknown,
): value is FeatureCollection {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as FeatureCollection).type === 'FeatureCollection' &&
    Array.isArray((value as FeatureCollection).features)
  );
}

function isFeature(value: unknown): value is Feature {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as Feature).type === 'Feature' &&
    !!(value as Feature).geometry
  );
}

function isGeometry(value: unknown): value is Geometry {
  if (!value || typeof value !== 'object') return false;
  const type = (value as Geometry).type;
  return typeof type === 'string' && GEOMETRY_TYPES.has(type);
}

/**
 * Normalize Feature | FeatureCollection | Geometry | Feature[] into a
 * FeatureCollection. Returns null for empty / unrecognized input.
 */
export function asFeatureCollection(input: unknown): FeatureCollection | null {
  if (input == null) return null;
  if (typeof input === 'string' || typeof input !== 'object') return null;

  if (isFeatureCollection(input)) return input;
  if (isFeature(input)) {
    return { type: 'FeatureCollection', features: [input] };
  }
  if (isGeometry(input)) {
    return {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: input }],
    };
  }
  if (Array.isArray(input)) {
    const features: Feature[] = [];
    for (const item of input) {
      if (isFeature(item)) {
        features.push(item);
        continue;
      }
      if (isGeometry(item)) {
        features.push({ type: 'Feature', properties: {}, geometry: item });
        continue;
      }
      const nested = asFeatureCollection(item);
      if (nested) features.push(...nested.features);
    }
    return features.length ? { type: 'FeatureCollection', features } : null;
  }
  return null;
}

function itemToFeature(
  item: unknown,
  options?: { defaultMissingGeometry?: boolean },
): Feature | null {
  if (item == null || typeof item !== 'object') return null;
  const rec = item as Record<string, unknown>;

  if (rec['type'] === 'Feature' && rec['geometry']) {
    return rec as unknown as Feature;
  }

  const geometry = rec['geometry'];
  if (geometry && typeof geometry === 'object') {
    const properties = rec['properties'];
    const id = rec['id'];
    const rest: Record<string, unknown> = { ...rec };
    delete rest['geometry'];
    delete rest['properties'];
    delete rest['id'];
    delete rest['type'];
    const props =
      properties && typeof properties === 'object' && !Array.isArray(properties)
        ? (properties as Record<string, unknown>)
        : rest;
    return {
      type: 'Feature',
      id: id as string | number | undefined,
      geometry: geometry as Geometry,
      properties: props,
    };
  }

  if (options?.defaultMissingGeometry) {
    const record = item as DataRecord;
    const { geometry: recordGeometry, id, ...rest } = record;
    const properties: Record<string, unknown> = { ...rest };
    if (id != null && properties['id'] == null) properties['id'] = id;
    return {
      type: 'Feature',
      id: id as string | number | undefined,
      geometry: (recordGeometry ?? {
        type: 'Point',
        coordinates: [0, 0],
      }) as Geometry,
      properties,
    };
  }

  return null;
}

/** Build a FeatureCollection from list rows, Features, or record-like objects. */
export function recordsToFeatureCollection(list: unknown[]): FeatureCollection {
  const features: Feature[] = [];
  for (const item of list) {
    const feature = itemToFeature(item);
    if (feature?.geometry) features.push(feature);
  }
  return { type: 'FeatureCollection', features };
}

/** Data-management records → FeatureCollection (default Point when geometry missing). */
export function toFeatureCollection(
  records: Array<DataRecord | undefined | null>,
): FeatureCollection {
  const features: Feature[] = [];
  for (const record of records) {
    const feature = itemToFeature(record, { defaultMissingGeometry: true });
    if (feature?.geometry) features.push(feature);
  }
  return { type: 'FeatureCollection', features };
}
