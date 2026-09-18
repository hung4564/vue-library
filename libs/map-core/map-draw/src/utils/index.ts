import type { MapSimple } from '@hungpvq/map-core';
import type { Feature } from 'geojson';
import type { LngLatLike, PointLike } from 'maplibre-gl';

/**
 * Stable feature id: top-level `feature.id`, else `properties.id`.
 * Prefer writing `properties.id` when saving (DrawService does this for adds)
 * and `promoteId: 'id'` on GeoJSON result sources so query hits expose ids.
 */
export function getFeatureId(
  feature: Feature,
): string | number | undefined {
  const fromProps = feature.properties?.['id'];
  const id = feature.id ?? fromProps;
  return id == null ? undefined : id;
}

/** String-normalized id equality for upsert / delete / select lookups. */
export function sameFeature(a: Feature, b: Feature): boolean {
  const ai = getFeatureId(a);
  const bi = getFeatureId(b);
  return ai != null && bi != null && String(ai) === String(bi);
}

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
  const features = getFeatureByMap(map, point, layerIds);
  if (!features || features.length < 1) {
    return;
  }
  return features[0];
};
