import { logHelper } from '@hungpvq/map-core';
import {
  type DatasetComponentItem,
  removeDatasetComponent,
  upsertDatasetComponent,
} from '@hungpvq/map-dataset';
import { logger } from '@hungpvq/map-dataset';
import { createMapScopedStore } from '@hungpvq/vue-map-core';
import type { Ref } from 'vue';
import { ref } from 'vue';

const KEY = 'dataset-component' as const;

export type ComponentItem = DatasetComponentItem;

export type MapDatasetComponentStore = {
  components: ComponentItem[];
  componentIds: Ref<string[]>;
};

export const useMapDatasetComponentStore = (mapId: string) =>
  createMapScopedStore<MapDatasetComponentStore>(mapId, KEY as any, () => {
    logHelper(logger, mapId, 'store')
      .with({ fn: 'useMapDatasetComponentStore', span: 'store.init' })
      .debug('Created scoped map store for mapId.');
    const components: ComponentItem[] = [];
    const componentIds = ref<string[]>([]);
    return {
      components,
      componentIds,
    };
  });

export const useMapDatasetComponent = (mapId: string) => {
  const store = useMapDatasetComponentStore(mapId);
  function getStore() {
    return store;
  }
  function getAllComponentIds() {
    return store.componentIds;
  }
  function addComponent(component: Omit<ComponentItem, 'id'>) {
    if (!store) return;
    logHelper(logger, mapId, 'store-component')
      .with({ fn: 'addComponent', span: 'store.add' })
      .debug('addComponent', {
        component,
        store,
      });
    return upsertDatasetComponent(store, component);
  }
  function removeComponent(id: string) {
    if (!store) return;
    logHelper(logger, mapId, 'store-component')
      .with({ fn: 'removeComponent', span: 'store.remove' })
      .debug('removeComponent', {
        id,
        store,
      });
    removeDatasetComponent(store, id);
  }

  return { getStore, getAllComponentIds, addComponent, removeComponent };
};
