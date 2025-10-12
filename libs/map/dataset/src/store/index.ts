import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import { defineStore } from '@hungpvq/shared-store';
import { useMapStore } from '@hungpvq/vue-map-core';
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IDataset } from '../interfaces/dataset.base';
import { logger } from '../logger';
import type { IListViewUI } from '../model';
import {
  applyToAllLeaves,
  findAllComponentsByType,
  traverseTree,
} from '../model/visitors';
import { isComposite, isDatasetMap } from '../utils/check';

const KEY = 'dataset';
export type MapLayerStore = {
  datasets: Record<string, IDataset>;
  datasetIds: Ref<string[]>;
};
export const useMapDatasetStore = (mapId: string) =>
  defineStore<MapLayerStore>(['map:core', mapId, KEY], () => {
    logHelper(logger, mapId, 'store').debug('init');
    return { datasets: {}, datasetIds: ref([]) };
  })();

export const useMapDataset = (propsMapId?: string) => {
  let mapId = propsMapId ?? '';
  let store = useMapDatasetStore(mapId);
  let { getMap } = useMapStore(mapId);
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
      // Track already added dependencies in this session to avoid duplicates.
      const addedSet = new Set<string>();

      traverseTree(
        layer,
        (node) => {
          // If this node has dependencies (dependsOn: string[]), add each dependency FIRST.
          if (Array.isArray(node.dependsOn)) {
            for (const depId of node.dependsOn) {
              if (!addedSet.has(depId)) {
                const dep = store.datasets[depId];
                if (isDatasetMap(dep)) {
                  dep.addToMap(map); // add dependency dataset to map before current node
                  addedSet.add(depId);
                }
              }
            }
          }
          // Then add the node itself
          if (
            isDatasetMap(node) &&
            typeof node.addToMap === 'function' &&
            !addedSet.has(node.id)
          ) {
            node.addToMap(map);
            addedSet.add(node.id);
          }
        },
        {},
      );
    });
    logHelper(logger, mapId, 'store').debug('addDataset', {
      store,
      dataset: layer,
    });
  }
  async function removeDataset(layer: IDataset) {
    if (!store) {
      return;
    }
    delete store.datasets[layer.id];
    store.datasetIds.value = store.datasetIds.value.filter(
      (id) => id !== layer.id,
    );
    getMap(async (map: MapSimple) => {
      const removedSet = new Set<string>();

      traverseTree(
        layer,
        (node) => {
          // Remove this node from the map FIRST (before dependencies)
          if (
            isDatasetMap(node) &&
            typeof node.removeFromMap === 'function' &&
            !removedSet.has(node.id)
          ) {
            node.removeFromMap(map);
            removedSet.add(node.id);
          }
          // Then remove dependencies (if any)
          if (Array.isArray(node.dependsOn)) {
            for (const depId of node.dependsOn) {
              if (!removedSet.has(depId)) {
                const dep = store.datasets[depId];
                if (isDatasetMap(dep)) {
                  dep.removeFromMap(map);
                  removedSet.add(depId);
                }
              }
            }
          }
        },
        { direction: 'rtl' },
      );
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
  function getDatasets() {
    return store.datasetIds.value.map((id) => store.datasets[id]);
  }
  return {
    setMapId(pMapId: string) {
      mapId = pMapId;
      store = useMapDatasetStore(pMapId);
      getMap = useMapStore(pMapId).getMap;
    },

    getDatasets,
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
