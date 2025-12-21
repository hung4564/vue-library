import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import { createMapScopedStore, useMapStore } from '@hungpvq/vue-map-core';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IDataset } from '../interfaces/dataset.base';
import { logger } from '../logger';
import { DatasetService } from '../services/dataset.service';

const KEY = 'dataset';
export type MapLayerStore = {
  datasets: Record<string, IDataset>;
  datasetIds: Ref<string[]>;
};
export const useMapDatasetStore = (mapId: string) =>
  createMapScopedStore<MapLayerStore>(mapId, KEY, () => {
    logHelper(logger, mapId, 'store').debug('init');
    return { datasets: {}, datasetIds: ref([]) };
  });

export const useMapDataset = (propsMapId?: string) => {
  let mapId = propsMapId ?? '';
  let store = useMapDatasetStore(mapId);
  let { getMap } = useMapStore(mapId);
  async function addDataset(layer: IDataset) {
    if (!store) {
      return;
    }
    getMap(async (map: MapSimple) => {
      await DatasetService.addDataset(store, map, layer);
    });
    logHelper(logger, mapId, 'store').debug('addDataset', {
      store,
      dataset: layer,
    });
  }
  async function removeDataset(layer: IDataset) {
    if (!store) {
      return;
    }
    getMap(async (map: MapSimple) => {
      await DatasetService.removeDataset(store, map, layer);
    });
    logHelper(logger, mapId, 'store').debug('removeDataset', {
      store,
      dataset: layer,
    });
  }
  function removeComponent(component: IDataset) {
    logHelper(logger, mapId, 'store').debug('removeComponent', component);
    getMap(async (map: MapSimple) => {
      DatasetService.removeComponent(map, component);
    });
  }
  function getStoreDataset() {
    return store;
  }
  function getAllComponentsByType<T>(targetType: string) {
    if (!store) {
      return [];
    }
    return DatasetService.getAllComponentsByType<T>(store, targetType);
  }

  function getDatasetIds() {
    return store.datasetIds;
  }
  function getDatasets() {
    return store.datasetIds.value.map((id) => store.datasets[id]);
  }
  return {
    setMapId(pMapId: string) {
      mapId = pMapId;
      store = useMapDatasetStore(pMapId);
      getMap = useMapStore(pMapId).getMap;
    },

    getDatasets,
    addDataset,
    getDatasetIds,
    removeComponent,
    removeDataset,
    getStoreDataset,
    getAllComponentsByType,
  };
};
export * from './component';
export * from './highlight';
