import { addStore, addToQueue, getStore } from '@hungpvq/vue-map-core';
import type { Ref } from 'vue';
import { ref } from 'vue';

export const KEY = 'dataset-component';

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

function initMapStore(mapId: string) {
  const components: ComponentItem[] = [];
  const componentIds = ref<string[]>([]);

  const store: MapDatasetComponentStore = {
    components,
    componentIds,
  };

  addStore<MapDatasetComponentStore>(mapId, KEY, store);
}

addToQueue(KEY, initMapStore);

export function getComponentStore(mapId: string) {
  return getStore<MapDatasetComponentStore>(mapId, KEY);
}
export function getAllComponentIds(mapId: string) {
  return getComponentStore(mapId)?.componentIds;
}

export function addComponent(
  mapId: string,
  component: Omit<ComponentItem, 'id'>
) {
  const store = getComponentStore(mapId);
  if (!store) return;

  if (component.check) {
    const index = store.components.findIndex((x) => x.check == component.check);
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
export function removeComponent(mapId: string, id: string) {
  const store = getComponentStore(mapId);
  if (!store) return;
  store.components = store.components.filter((x) => x.id !== id);
  store.componentIds.value = store.componentIds.value.filter((x) => x !== id);
}
