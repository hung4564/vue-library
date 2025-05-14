import type { MapSimple } from '@hungpvq/shared-map';
import { addStore, addToQueue, getMap, getStore } from '@hungpvq/vue-map-core';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IListViewUI } from '../interfaces';
import type { IDataset } from '../interfaces/dataset.base';
import {
  applyToAllLeaves,
  findAllComponentsByType,
} from '../model/dataset.visitors';
import { isComposite, isDatasetMap } from '../utils/check';

export const KEY = 'dataset';
export type MapLayerStore = {
  datasets: Record<string, IDataset>;
  datasetIds: Ref<string[]>;
};
export function initMapLayer(mapId: string) {
  addStore<MapLayerStore>(mapId, KEY, { datasets: {}, datasetIds: ref([]) });
}
addToQueue(KEY, initMapLayer);
export async function addDataset(mapId: string, layer: IDataset) {
  const store = getStoreDataset(mapId);
  if (!store) {
    return;
  }
  const currentLists = getAllComponentsByType<IListViewUI>(mapId, 'list');
  const allComponentsOfType = findAllComponentsByType(
    layer,
    'list',
  ) as Array<IListViewUI>;
  store.datasets[layer.id] = layer;
  allComponentsOfType.forEach((list, i) => {
    list.index = i + 1 + currentLists.length;
  });
  store.datasetIds.value.push(layer.id);
  getMap(mapId, async (map: MapSimple) => {
    applyToAllLeaves(layer, [
      (leaf) => {
        if (isDatasetMap(leaf)) {
          leaf.addToMap(map);
        }
      },
    ]);
  });
}
export function removeDataset(mapId: string, layer: IDataset) {
  const store = getStoreDataset(mapId);
  if (!store) {
    return;
  }
  delete store.datasets[layer.id];
  getMap(mapId, async (map: MapSimple) => {
    applyToAllLeaves(layer, [
      (leaf) => {
        if (isDatasetMap(leaf)) {
          leaf.removeFromMap(map);
        }
      },
    ]);
  });
}
export function removeComponent(mapId: string, component: IDataset) {
  const parent = component.getParent() || component;
  getMap(mapId, async (map: MapSimple) => {
    if (isDatasetMap(component)) {
      component.removeFromMap(map);
    }
    applyToAllLeaves(parent, [
      (leaf) => {
        if (isDatasetMap(leaf)) {
          leaf.removeFromMap(map);
        }
      },
    ]);
  });
  // Remove component from parent
  if (parent && isComposite(parent)) {
    parent.remove(component);
  }
}
export function getStoreDataset(mapId: string) {
  const store = getStore<MapLayerStore>(mapId, KEY);
  return store;
}
export function getAllComponentsByType<T>(mapId: string, targetType: string) {
  const store = getStoreDataset(mapId);
  if (!store) {
    return [];
  }
  const views: T[] = [];
  (Object.values(store.datasets || {}) || []).forEach((dataset) => {
    const allComponentsOfType = findAllComponentsByType(dataset, targetType);
    views.push(...(allComponentsOfType as T[]));
  });
  return views;
}

export function getDatasetIds(mapId: string) {
  const store = getStore<MapLayerStore>(mapId, KEY);
  return store.datasetIds;
}
export * from './component';
export * from './highlight';
