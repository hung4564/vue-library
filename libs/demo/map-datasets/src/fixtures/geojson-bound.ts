import { bboxFromGeojson } from '@hungpvq/map-core';
import {
  createDatasetPartBoundComponent,
  type IDataset,
} from '@hungpvq/map-dataset';
import type { Feature, FeatureCollection } from 'geojson';

/** Bound part so `createMenuItemToBoundActionForList()` can resolve bbox. */
export function createBoundFromGeojson(
  name: string,
  geojson: FeatureCollection | Feature[],
): IDataset | undefined {
  const data: FeatureCollection = Array.isArray(geojson)
    ? { type: 'FeatureCollection', features: geojson }
    : geojson;
  const bbox = bboxFromGeojson(data);
  if (!bbox) return undefined;
  return createDatasetPartBoundComponent(name, bbox);
}
