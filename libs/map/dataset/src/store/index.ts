import { MapSimple } from '@hungpvq/shared-map';
import {
  addStore,
  addToQueue,
  getMap,
  getStore,
  IListView,
} from '@hungpvq/vue-map-core';
import { IDataset } from '../interfaces/dataset.base';
import {
  applyToAllLeaves,
  findAllComponentsByType,
} from '../model/dataset.visitors';
import { isComposite, isDatasetMap } from '../utils/check';

export const KEY = 'dataset';
export type MapLayerStore = {
  datasets: Record<string, IDataset>;
};
export function initMapLayer(mapId: string) {
  addStore<MapLayerStore>(mapId, KEY, { datasets: {} });
}
addToQueue(KEY, initMapLayer);
export async function addDataset(mapId: string, layer: IDataset) {
  const store = getStoreDataset(mapId);
  if (!store) {
    return;
  }
  const currentLists = getAllComponentsByType<IListView & IDataset>(
    mapId,
    'list'
  );
  const allComponentsOfType = findAllComponentsByType(layer, 'list') as Array<
    IListView & IDataset
  >;
  store.datasets[layer.id] = layer;
  allComponentsOfType.forEach((list, i) => {
    list.index = i + 1 + currentLists.length;
  });
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
  getMap(mapId, async (map: MapSimple) => {
    const parent = component.getParent() || component;
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
    // Remove component from parent
    if (parent && isComposite(parent)) {
      parent.remove(component);
    }
  });
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
  Object.values(store.datasets).forEach((dataset) => {
    const allComponentsOfType = findAllComponentsByType(dataset, targetType);
    views.push(...(allComponentsOfType as T[]));
  });
  return views;
}
