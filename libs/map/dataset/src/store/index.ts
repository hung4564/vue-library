import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import { createMapScopedStore, useMapStore } from '@hungpvq/vue-map-core';
import { type Ref, ref } from 'vue';
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

export const useMapDataset = (initialMapId?: string) => {
  const mapId = ref(initialMapId ?? '');

  function getStore() {
    if (!mapId.value) return undefined;
    return useMapDatasetStore(mapId.value);
  }

  function getMapHelper() {
    if (!mapId.value) return undefined;
    return useMapStore(mapId.value).getMap;
  }

  async function addDataset(layer: IDataset) {
    const store = getStore();
    const getMap = getMapHelper();
    if (!store || !getMap) return;

    getMap(async (map: MapSimple) => {
      await DatasetService.addDataset(store, map, layer);
    });

    logHelper(logger, mapId.value, 'store').debug('addDataset', {
      store,
      dataset: layer,
    });
  }

  async function removeDataset(layer: IDataset) {
    const store = getStore();
    const getMap = getMapHelper();
    if (!store || !getMap) return;

    getMap(async (map: MapSimple) => {
      await DatasetService.removeDataset(store, map, layer);
    });

    logHelper(logger, mapId.value, 'store').debug('removeDataset', {
      store,
      dataset: layer,
    });
  }

  function removeComponent(component: IDataset) {
    const getMap = getMapHelper();
    if (!getMap) return;

    logHelper(logger, mapId.value, 'store').debug('removeComponent', component);
    getMap(async (map: MapSimple) => {
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

export * from './component';
export * from './highlight';
