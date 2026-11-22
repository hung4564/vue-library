import type { Feature, Geometry } from 'geojson';

export function convertFeatureToItem<T = unknown>(feature: Feature): T {
  return {
    id: feature.id,
    ...(feature.properties || {}),
    geometry: feature.geometry,
  } as T;
}

export function convertItemToFeature(item: {
  id?: string | number;
  geometry: Geometry;
  [key: string]: unknown;
}): Feature {
  const { geometry, id, ...properties } = item;
  return {
    id: id,
    type: 'Feature',
    geometry,
    properties,
  };
}
