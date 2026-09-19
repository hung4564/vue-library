import { isUsableMapId, logHelper, type MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import { DatasetService, logger } from '@hungpvq/map-dataset';
import { useMapStore } from '@hungpvq/vue-map-core';
import { ref } from 'vue';
import { useMapDatasetStore } from './dataset-store';

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

    logHelper(logger, mapId.value, 'store')
      .with({ fn: 'addDataset', span: 'store.add' })
      .debug('addDataset', {
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

    logHelper(logger, mapId.value, 'store')
      .with({ fn: 'removeDataset', span: 'store.remove' })
      .debug('removeDataset', {
        store,
        dataset: layer,
      });
  }

  function removeComponent(component: IDataset) {
    const getMapFn = getMapHelper();
    if (!getMapFn) return;

    logHelper(logger, mapId.value, 'store')
      .with({ fn: 'removeComponent', span: 'store.remove' })
      .debug('removeComponent', component);
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
