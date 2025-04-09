import type { MapSimple } from '@hungpvq/shared-map';

export interface IDatasetMap {
  addToMap(map: MapSimple, beforeId?: string): void;
  removeFromMap(map: MapSimple): void;
  getExecutionOrder?(functionName: string): number;
  setExecutionOrder?(functionName: string, order: number): void;
}
