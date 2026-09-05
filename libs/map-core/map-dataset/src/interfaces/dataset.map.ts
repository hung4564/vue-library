import type { MapSimple } from '@hungpvq/map-core';

export interface IDatasetMap {
  addToMap(map: MapSimple, beforeId?: string): void;
  removeFromMap(map: MapSimple): void;
}
