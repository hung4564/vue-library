import { getMap, isUsableMapId, logHelper } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  DatasetService,
  logger,
  MAP_DATASET_STORE_KEY,
} from '@hungpvq/map-dataset';
import { createMapScopedStore, getStore } from '@hungpvq/react-map-core';

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
  if (!isUsableMapId(mapId)) {
    throw new Error('mapId is required');
  }
  return createMapScopedStore<MapLayerStore>(
    mapId,
    MAP_DATASET_STORE_KEY as string & object,
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
        const store = getStore<MapLayerStore>(mapId, MAP_DATASET_STORE_KEY);
        if (!store) return;
        return clearDatasetsOnRemoveMap(mapId, store);
      },
    },
  );
}

/** Inert stand-in when mapId is not set yet (matches Vue: defer store until setMapId). */
const EMPTY_MAP_LAYER_STORE: MapLayerStore = {
  datasets: {},
  datasetIds: { value: [] },
  version: 0,
  listeners: new Set(),
  allLayerShow: true,
};

export function useMapDatasetStore(mapId: string): MapLayerStore {
  if (!isUsableMapId(mapId)) return EMPTY_MAP_LAYER_STORE;
  return getMapDatasetStore(mapId);
}
