import { logHelper } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import { createMapScopedStore } from '@hungpvq/react-map-core';
import { logger } from '@hungpvq/map-dataset';

const KEY = 'dataset' as const;

export type MapLayerStore = {
  datasets: Record<string, IDataset>;
  datasetIds: { value: string[] };
  version: number;
  listeners: Set<() => void>;
  allLayerShow: boolean;
};

export function notify(store: MapLayerStore) {
  store.version += 1;
  store.listeners.forEach((listener) => listener());
}

/** Call after DatasetService mutates the store so React subscribers refresh. */
export function notifyMapDatasetStore(store: MapLayerStore) {
  notify(store);
}

/** Imperative store accessor (safe outside React render). */
export function getMapDatasetStore(mapId: string) {
  return createMapScopedStore<MapLayerStore>(mapId, KEY as string & object, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return {
      datasets: {},
      datasetIds: { value: [] },
      version: 0,
      listeners: new Set(),
      allLayerShow: true,
    };
  });
}

export function useMapDatasetStore(mapId: string) {
  return getMapDatasetStore(mapId);
}
