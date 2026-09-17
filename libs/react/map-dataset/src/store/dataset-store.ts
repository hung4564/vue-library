import { getMap, logHelper } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import { DatasetService, logger } from '@hungpvq/map-dataset';
import { createMapScopedStore, getStore } from '@hungpvq/react-map-core';

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

async function clearDatasetsOnRemoveMap(
  mapId: string,
  store: MapLayerStore,
): Promise<void> {
  const ids = [...store.datasetIds.value];
  if (!ids.length) return;
  const map = getMap(mapId);
  logHelper(logger, mapId, 'store').debug('clear datasets on removeMap', {
    count: ids.length,
  });
  for (const id of ids) {
    const layer = store.datasets[id];
    if (!layer) continue;
    if (map) {
      await DatasetService.removeDataset(store, map, layer);
    } else {
      delete store.datasets[id];
      store.datasetIds.value = store.datasetIds.value.filter((x) => x !== id);
    }
  }
  store.listeners.clear();
}

/** Imperative store accessor (safe outside React render). */
export function getMapDatasetStore(mapId: string): MapLayerStore {
  return createMapScopedStore<MapLayerStore>(
    mapId,
    KEY as string & object,
    () => {
      logHelper(logger, mapId, 'store').debug('init');
      return {
        datasets: {},
        datasetIds: { value: [] },
        version: 0,
        listeners: new Set(),
        allLayerShow: true,
      };
    },
    {
      cleanup: (): void | Promise<void> => {
        const store = getStore<MapLayerStore>(mapId, KEY);
        if (!store) return;
        return clearDatasetsOnRemoveMap(mapId, store);
      },
    },
  );
}

export function useMapDatasetStore(mapId: string): MapLayerStore {
  return getMapDatasetStore(mapId);
}
