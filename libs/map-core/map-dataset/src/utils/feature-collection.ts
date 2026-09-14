import type { Feature, FeatureCollection, Geometry } from 'geojson';

const GEOMETRY_TYPES = new Set([
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection',
]);

function isFeatureCollection(value: unknown): value is FeatureCollection {
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
