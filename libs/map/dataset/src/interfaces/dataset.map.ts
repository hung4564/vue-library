import type { MapSimple } from '@hungpvq/shared-map';
import type { IDataset } from './dataset.base';

export interface IDatasetMap {
  addToMap(map: MapSimple, beforeId?: string): void;
  removeFromMap(map: MapSimple): void;
}
