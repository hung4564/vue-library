import { isUsableMapId, logHelper, type MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import {
  DatasetService,
  logger,
  notifyMapDatasetStore,
} from '@hungpvq/map-dataset';
import { useMapStore } from '@hungpvq/vue-map-core';
import {
  getCurrentScope,
  onScopeDispose,
  ref,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';
import { useMapDatasetStore } from './dataset-store';

const EMPTY_DATASET_IDS = { value: [] as string[] };

/**
 * Dataset list API for one map.
 *
 * Pass a ref/computed/`() => mapId` (not a one-shot `mapId.value`) so the hook
 * rebinds when inject / `props.mapId` becomes ready. Passing a frozen string at
 * setup leaves LayerControl on the empty store and the list never updates.
 */
export const useMapDataset = (
  mapIdSource?: MaybeRefOrGetter<string | undefined>,
) => {
  const mapId = ref(
    typeof toValue(mapIdSource) === 'string' ? (toValue(mapIdSource) as string) : '',
  );
  /** UI tick — follows store.version and remounts when mapId rebinds. */
  const datasetVersion = shallowRef(0);

  let detachListener: (() => void) | undefined;

  function attachListener() {
    detachListener?.();
    detachListener = undefined;
    if (!isUsableMapId(mapId.value)) {
      datasetVersion.value += 1;
      return;
    }
    const store = useMapDatasetStore(mapId.value);
    const bump = () => {
      datasetVersion.value = store.version;
    };
    bump();
    store.listeners.add(bump);
    detachListener = () => {
      store.listeners.delete(bump);
    };
  }

  const scope = getCurrentScope();
  if (scope) {
    watch(
      () => {
        const raw = toValue(mapIdSource);
        return typeof raw === 'string' ? raw : '';
      },
      (next) => {
        if (next !== mapId.value) {
          mapId.value = next;
        }
      },
      { immediate: true },
    );
    watch(mapId, attachListener, { immediate: true });
    onScopeDispose(() => {
      detachListener?.();
    });
  } else {
    attachListener();
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
      if (!scope) attachListener();
    },
    mapId,
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
