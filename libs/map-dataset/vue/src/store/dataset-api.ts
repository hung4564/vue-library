import { isUsableMapId } from '@hungpvq/map-core';
import type { IDataset } from '@hungpvq/map-dataset';
import { createMapDatasetController } from '@hungpvq/map-dataset';
import {
  getCurrentScope,
  type MaybeRefOrGetter,
  onScopeDispose,
  ref,
  shallowRef,
  toValue,
  watch,
} from 'vue';

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
    typeof toValue(mapIdSource) === 'string'
      ? (toValue(mapIdSource) as string)
      : '',
  );
  /** UI tick — follows store.version and remounts when mapId rebinds. */
  const datasetVersion = shallowRef(0);

  const controller = createMapDatasetController(() => mapId.value);

  let detachListener: (() => void) | undefined;

  function attachListener() {
    detachListener?.();
    detachListener = undefined;
    if (!isUsableMapId(mapId.value)) {
      datasetVersion.value += 1;
      return;
    }
    const bump = () => {
      datasetVersion.value = controller.getVersion();
    };
    bump();
    detachListener = controller.subscribe(bump);
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

  return {
    setMapId(pMapId: string) {
      mapId.value = pMapId;
      if (!scope) attachListener();
    },
    mapId,
    getDatasets: controller.getDatasets,
    addDataset: controller.addDataset,
    getDatasetIds: controller.getDatasetIds,
    removeComponent: controller.removeComponent,
    removeDataset: controller.removeDataset,
    getStoreDataset: controller.getStore,
    getAllComponentsByType: controller.getAllComponentsByType,
    datasetVersion,
  };
};
