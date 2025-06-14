import { logHelper } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import type { Ref } from 'vue';
import { ref } from 'vue';
import { logger } from '../logger';

const KEY = 'dataset-component';

export type ComponentItem = {
  id: string;
  check?: string;
  component: () => any;
  attr: any;
};

export type MapDatasetComponentStore = {
  components: ComponentItem[];
  componentIds: Ref<string[]>;
};

function generateId(prefix = 'component'): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 11)}`;
}

export const useMapDatasetComponentStore = (mapId: string) =>
  defineStore<MapDatasetComponentStore>(['map:core', mapId, KEY], () => {
    logHelper(logger, mapId, 'store').debug('init');
    const components: ComponentItem[] = [];
    const componentIds = ref<string[]>([]);
    return {
      components,
      componentIds,
    };
  })();

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

    logHelper(logger, mapId, 'store-component').debug('addComponent', {
      component,
      store,
    });
    if (component.check) {
      const index = store.components.findIndex(
        (x) => x.check == component.check,
      );
      if (index >= 0) {
        const id = store.components[index].id;
        Object.assign(store.components[index], component);
        store.componentIds.value.splice(index, 1);
        store.componentIds.value.push(id);
        return id;
      }
    }
    const id = generateId();
    store.components.push({
      ...component,
      id,
    });
    store.componentIds.value.push(id);
    return id;
  }
  function removeComponent(id: string) {
    if (!store) return;
    logHelper(logger, mapId, 'store-component').debug('removeComponent', {
      id,
      store,
    });
    store.components = store.components.filter((x) => x.id !== id);
    store.componentIds.value = store.componentIds.value.filter((x) => x !== id);
  }

  return { getStore, getAllComponentIds, addComponent, removeComponent };
};
