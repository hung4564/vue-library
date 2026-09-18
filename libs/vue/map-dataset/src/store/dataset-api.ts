import { getMap, isUsableMapId, logHelper, type MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  DatasetService,
  logger,
  MAP_DATASET_STORE_KEY,
} from '@hungpvq/map-dataset';
import {
  createMapScopedStore,
  getStore,
  useMapStore,
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
}

export function useMapDatasetStore(mapId: string): MapLayerStore {
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

export const useMapDataset = (initialMapId?: string) => {
  const mapId = ref(initialMapId ?? '');

  function getStore() {
    if (!isUsableMapId(mapId.value)) return undefined;
    return useMapDatasetStore(mapId.value);
  }

  function getMapHelper() {
    if (!isUsableMapId(mapId.value)) return undefined;
    return useMapStore(mapId.value).getMap;
  }

  async function addDataset(layer: IDataset) {
    const store = getStore();
    const getMapFn = getMapHelper();
    if (!store || !getMapFn) return;

    getMapFn(async (map: MapSimple) => {
      await DatasetService.addDataset(store, map, layer);
    });

    logHelper(logger, mapId.value, 'store').debug('addDataset', {
      datasetId: layer.id,
      name: layer.getName?.() ?? layer.id,
    });
  }

  async function removeDataset(layer: IDataset) {
    const store = getStore();
    const getMapFn = getMapHelper();
    if (!store || !getMapFn) return;

    getMapFn(async (map: MapSimple) => {
      await DatasetService.removeDataset(store, map, layer);
    });

    logHelper(logger, mapId.value, 'store').debug('removeDataset', {
      store,
      dataset: layer,
    });
  }

  function removeComponent(component: IDataset) {
    const getMapFn = getMapHelper();
    if (!getMapFn) return;

    logHelper(logger, mapId.value, 'store').debug('removeComponent', component);
    getMapFn(async (map: MapSimple) => {
      DatasetService.removeComponent(map, component);
    });
  }

  function getAllComponentsByType<T extends IDataset>(targetType: string) {
    const store = getStore();
    if (!store) return [];
    return DatasetService.getAllComponentsByType<T>(store, targetType);
  }

  function getDatasetIds() {
    const store = getStore();
    return store?.datasetIds ?? ref([]);
  }

  function getDatasets() {
    const store = getStore();
    if (!store) return [];
    return store.datasetIds.value.map((id) => store.datasets[id]);
  }

  return {
    setMapId(pMapId: string) {
      mapId.value = pMapId;
    },
    getDatasets,
    addDataset,
    getDatasetIds,
    removeComponent,
    removeDataset,
    getStoreDataset: getStore,
    getAllComponentsByType,
  };
};
