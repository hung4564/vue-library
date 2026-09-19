import { getMap, isUsableMapId, logHelper } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  DatasetService,
  logger,
  MAP_DATASET_STORE_KEY,
} from '@hungpvq/map-dataset';
import {
  createMapScopedStore,
  getStore,
} from '@hungpvq/vue-map-core';
import { type Ref, ref } from 'vue';

export type MapLayerStore = {
  datasets: Record<string, IDataset>;
  datasetIds: Ref<string[]>;
  allLayerShow: Ref<boolean>;
};

async function clearDatasetsOnRemoveMap(
  mapId: string,
  store: MapLayerStore,
): Promise<void> {
  const ids = [...store.datasetIds.value];
  if (!ids.length) return;
  const map = getMap(mapId);
  logHelper(logger, mapId, 'store')
    .with({ fn: 'clearDatasetsOnRemoveMap', span: 'store.clear' })
    .debug('clear datasets on removeMap', {
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
}

/** Imperative store accessor (safe outside component setup). */
export function getMapDatasetStore(mapId: string): MapLayerStore {
  if (!isUsableMapId(mapId)) {
    throw new Error('mapId is required');
  }
  return createMapScopedStore<MapLayerStore>(
    mapId,
    MAP_DATASET_STORE_KEY as string & object,
    () => {
      logHelper(logger, mapId, 'store')
        .with({ fn: 'getMapDatasetStore', span: 'store.init' })
        .debug('init');
      return {
        datasets: {},
        datasetIds: ref([]),
        allLayerShow: ref(true),
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

/** Inert stand-in when mapId is not set yet (defer store until setMapId). */
const EMPTY_MAP_LAYER_STORE: MapLayerStore = {
  datasets: {},
  datasetIds: ref([]),
  allLayerShow: ref(true),
};

export function useMapDatasetStore(mapId: string): MapLayerStore {
  if (!isUsableMapId(mapId)) return EMPTY_MAP_LAYER_STORE;
  return getMapDatasetStore(mapId);
}
