import { isUsableMapId, logHelper, type MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  DatasetService,
  logger,
  notifyMapDatasetStore,
} from '@hungpvq/map-dataset';
import { useMapStore } from '@hungpvq/vue-map-core';
import { getCurrentScope, onScopeDispose, ref, shallowRef, watch } from 'vue';
import { useMapDatasetStore } from './dataset-store';

const EMPTY_DATASET_IDS = { value: [] as string[] };

export const useMapDataset = (initialMapId?: string) => {
  const mapId = ref(initialMapId ?? '');
  const datasetVersion = shallowRef(0);

  let detachListener: (() => void) | undefined;

  function syncVersionFromStore() {
    if (!isUsableMapId(mapId.value)) {
      datasetVersion.value = 0;
      return;
    }
    datasetVersion.value = useMapDatasetStore(mapId.value).version;
  }

  function attachListener() {
    detachListener?.();
    detachListener = undefined;
    if (!isUsableMapId(mapId.value)) {
      datasetVersion.value = 0;
      return;
    }
    const store = useMapDatasetStore(mapId.value);
    datasetVersion.value = store.version;
    const bump = () => {
      datasetVersion.value = store.version;
    };
    store.listeners.add(bump);
    detachListener = () => {
      store.listeners.delete(bump);
    };
  }

  // setup() only — imperative @mapLoaded calls have no effect scope
  const scope = getCurrentScope();
  if (scope) {
    watch(mapId, attachListener, { immediate: true });
    onScopeDispose(() => {
      detachListener?.();
    });
  } else {
    syncVersionFromStore();
  }

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
      notifyMapDatasetStore(store);
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
      notifyMapDatasetStore(store);
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
      const store = getStore();
      if (store) notifyMapDatasetStore(store);
    });
  }

  function getAllComponentsByType<T extends IDataset>(targetType: string) {
    const store = getStore();
    if (!store) return [];
    return DatasetService.getAllComponentsByType<T>(store, targetType);
  }

  function getDatasetIds() {
    return getStore()?.datasetIds ?? EMPTY_DATASET_IDS;
  }

  function getDatasets() {
    const store = getStore();
    if (!store) return [];
    return store.datasetIds.value.map((id) => store.datasets[id]);
  }

  return {
    setMapId(pMapId: string) {
      mapId.value = pMapId;
      if (!scope) syncVersionFromStore();
    },
    getDatasets,
    addDataset,
    getDatasetIds,
    removeComponent,
    removeDataset,
    getStoreDataset: getStore,
    getAllComponentsByType,
    datasetVersion,
  };
};
