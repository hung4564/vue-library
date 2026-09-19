import type { Feature, FeatureCollection, GeoJSON } from 'geojson';

/**
 * Stable property written when a Feature has no `id` / `properties.id`.
 * Used as MapLibre `promoteId` so Identify ↔ AttributeTable match after zoom.
 */
export const GEOJSON_FEATURE_ID_KEY = '_id';

function existingFeatureId(
  feature: Feature,
  key: string,
): string {
  if (feature.id != null && String(feature.id) !== '') return String(feature.id);
  const props = feature.properties;
  if (props && typeof props === 'object') {
    const propId = props['id'];
    if (propId != null && String(propId) !== '') return String(propId);
    const stable = props[key];
    if (stable != null && String(stable) !== '') return String(stable);
  }
  return '';
}

function ensureOneFeature(
  feature: Feature,
  index: number,
  key: string,
): Feature {
  const id = existingFeatureId(feature, key) || `f:${index}`;
  const props: Record<string, unknown> = {
    ...(feature.properties ?? {}),
  };
  if (props[key] == null || String(props[key]) === '') {
    props[key] = id;
  }
  return {
    ...feature,
    id: feature.id ?? id,
    properties: props,
  };
}

/**
 * Stamp every Feature with a stable {@link GEOJSON_FEATURE_ID_KEY} (and
 * `feature.id` when missing) so Identify / AttributeTable do not rely on
 * MapLibre-rendered coordinates that drift with zoom.
 */
export function ensureGeojsonFeatureIds(
  geojson: GeoJSON,
  options?: { key?: string },
): GeoJSON {
  const key = options?.key ?? GEOJSON_FEATURE_ID_KEY;
  if (geojson.type === 'Feature') {
    return ensureOneFeature(geojson, 0, key);
  }
  if (geojson.type === 'FeatureCollection') {
    const next: FeatureCollection = {
      ...geojson,
      features: geojson.features.map((feature, index) =>
        ensureOneFeature(feature, index, key),
      ),
    };
    return next;
  }
  return geojson;
}
