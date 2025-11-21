import type { MapSimple } from '@hungpvq/shared-map';
import type { Feature } from 'geojson';
import type { LngLatLike, PointLike } from 'maplibre-gl';

export const getFeatureByMap = (
  map: MapSimple,
  point: LngLatLike,
  layerIds: string[] = [],
): Feature[] => {
  const p = map.project(point);
  const pointOrBox = [
    [p.x - 5, p.y - 5],
    [p.x + 5, p.y + 5],
  ] as [PointLike, PointLike];
  const features = map.queryRenderedFeatures(pointOrBox, {
    layers: layerIds,
  });
  return features;
};

export const getFirstFeatureByMap = (
  map: MapSimple,
  point: LngLatLike,
  layerIds: string[] = [],
): Feature | undefined => {
  const p = map.project(point);
  const pointOrBox = [
    [p.x - 5, p.y - 5],
    [p.x + 5, p.y + 5],
  ] as [PointLike, PointLike];
  const features = map.queryRenderedFeatures(pointOrBox, {
    layers: layerIds,
  });
  if (!features || features.length < 1) {
    return;
  }
  return features[0];
};
