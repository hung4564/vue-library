import type { Feature } from 'geojson';

export function convertFeatureToItem<T>(feature: Feature): T {
  return {
    id: feature.id,
    ...feature.properties,
    geometry: feature.geometry,
  } as T;
}

export function convertItemToFeature(item: any): Feature {
  const { geometry, ...properties } = item;
  return {
    id: item.id,
    type: 'Feature',
    geometry,
    properties,
  };
}
