import type {
  AddGeojsonHerePayload,
  MapAddGeojsonHereLayerType,
} from '@hungpvq/map-core/menu';

import type { IDataset } from '../interfaces/dataset.base';
import { asFeatureCollection } from '../utils/feature-collection';
import { createGeoJsonDataset } from './builder';
import { detectGeojsonStyleType } from './geojson-parse';

export function createGeojsonHereDataset(
  payload: AddGeojsonHerePayload,
): IDataset {
  const type: MapAddGeojsonHereLayerType =
    payload.type ?? detectGeojsonStyleType(payload.geojson);
  return createGeoJsonDataset({
    name: payload.name,
    geojson: asFeatureCollection(payload.geojson) ?? {
      type: 'FeatureCollection',
      features: [],
    },
    type,
    opacity: payload.opacity ?? 1,
    color: payload.color,
  });
}
