import { addStore, addToQueue, getStore } from '@hungpvq/vue-map-core';
import { ref } from 'vue';
import type { Ref } from 'vue';

export const KEY = 'dataset-component';

export type ComponentItem = {
  id: string;
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

  // Check for duplicate component based on attr only
  const isDuplicate = store.components.some(
    (existing) =>
      JSON.stringify(existing.attr) === JSON.stringify(component.attr)
  );

  if (isDuplicate) {
    console.warn('Component already exists with the same attributes');
    return null;
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
