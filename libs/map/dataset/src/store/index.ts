import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { useMapStore } from '@hungpvq/vue-map-core';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IListViewUI } from '../interfaces';
import type { IDataset } from '../interfaces/dataset.base';
import { logger } from '../logger';
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
export const useMapDatasetStore = (mapId: string) =>
  defineStore<MapLayerStore>(['map:core', mapId, KEY], () => {
    logHelper(logger, mapId, 'store').debug('init');
    return { datasets: {}, datasetIds: ref([]) };
  })();

export const useMapDataset = (mapId: string) => {
  const store = useMapDatasetStore(mapId);
  const { getMap } = useMapStore(mapId);
  async function addDataset(layer: IDataset) {
    if (!store) {
      return;
    }
    const currentLists = getAllComponentsByType<IListViewUI>('list');
    const allComponentsOfType = findAllComponentsByType(
      layer,
      'list',
    ) as Array<IListViewUI>;
    store.datasets[layer.id] = layer;
    allComponentsOfType.forEach((list, i) => {
      list.index = i + 1 + currentLists.length;
    });
    store.datasetIds.value.push(layer.id);
    getMap(async (map: MapSimple) => {
      applyToAllLeaves(layer, [
        (leaf) => {
          if (isDatasetMap(leaf)) {
            leaf.addToMap(map);
          }
        },
      ]);
    });
    logHelper(logger, mapId, 'store').debug('addDataset', {
      store,
      dataset: layer,
    });
  }
  function removeDataset(mapId: string, layer: IDataset) {
    if (!store) {
      return;
    }
    delete store.datasets[layer.id];
    getMap(async (map: MapSimple) => {
      applyToAllLeaves(layer, [
        (leaf) => {
          if (isDatasetMap(leaf)) {
            leaf.removeFromMap(map);
          }
        },
      ]);
    });
    logHelper(logger, mapId, 'store').debug('removeDataset', {
      store,
      dataset: layer,
    });
  }
  function removeComponent(component: IDataset) {
    logHelper(logger, mapId, 'store').debug('removeComponent', component);
    const parent = component.getParent() || component;
    getMap(async (map: MapSimple) => {
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
  function getStoreDataset() {
    return store;
  }
  function getAllComponentsByType<T>(targetType: string) {
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

  function getDatasetIds() {
    return store.datasetIds;
  }
  return {
    addDataset,
    getDatasetIds,
    removeComponent,
    removeDataset,
    getStoreDataset,
    getAllComponentsByType,
  };
};
export * from './component';
export * from './highlight';
