import type {
  AddGeojsonHerePayload,
  MapAddGeojsonHereLayerType,
} from '@hungpvq/map-core';
import type { GeoJSON } from 'geojson';
import { createGeoJsonDataset } from '../../builder/geojson';
import type { IDataset } from '../../interfaces';
import { detectGeojsonStyleType } from '../create-control/geojson-parse';

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

export function createGeojsonHereDataset(
  payload: AddGeojsonHerePayload,
): IDataset {
  const type: MapAddGeojsonHereLayerType =
    payload.type ?? detectGeojsonStyleType(payload.geojson);
  return createGeoJsonDataset({
    name: payload.name,
    geojson: toFeatureCollection(payload.geojson),
    type,
    opacity: payload.opacity ?? 1,
    color: payload.color,
  });
}
