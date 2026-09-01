import type {
  AddGeojsonHerePayload,
  MapAddGeojsonHereLayerType,
} from '@hungpvq/map-core';
import type { GeoJSON } from 'geojson';
import { createGeoJsonDataset } from '../../builder/geojson';
import type { IDataset } from '../../interfaces';
import type { LayerStyleType } from '../../utils/layer-simple-builder';

function toFeatureCollection(geojson: GeoJSON): GeoJSON {
  if (geojson.type === 'FeatureCollection') return geojson;
  if (geojson.type === 'Feature') {
    return { type: 'FeatureCollection', features: [geojson] };
  }
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', properties: {}, geometry: geojson }],
  };
}

function inferLayerType(geojson: GeoJSON): LayerStyleType {
  const geometryType =
    geojson.type === 'FeatureCollection'
      ? geojson.features[0]?.geometry?.type
      : geojson.type === 'Feature'
        ? geojson.geometry?.type
        : geojson.type;
  if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
    return 'area';
  }
  if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
    return 'line';
  }
  return 'point';
}

export function createGeojsonHereDataset(
  payload: AddGeojsonHerePayload,
): IDataset {
  const type: MapAddGeojsonHereLayerType =
    payload.type ?? inferLayerType(payload.geojson);
  return createGeoJsonDataset({
    name: payload.name,
    geojson: toFeatureCollection(payload.geojson),
    type,
    opacity: payload.opacity ?? 1,
    color: payload.color,
  });
}
