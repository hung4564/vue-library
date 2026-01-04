import type { MapSimple } from '@hungpvq/shared-map';
import { errorHandler } from '@hungpvq/vue-map-core';
import { DatasetError } from '../errors';
import type { IDataset } from '../interfaces/dataset.base';
import type { IListViewUI } from '../model';
import {
  applyToAllLeaves,
  findAllComponentsByType,
  traverseTree,
} from '../model/visitors';
import type { MapLayerStore } from '../store';
import {
  isComposite,
  isDatasetMapHasAddToMap,
  isDatasetMapHasRemoveFromMap,
} from '../utils/check';

/**
 * Service for managing datasets and their lifecycle on the map.
 * Decouples business logic from the Vue store.
 */
export class DatasetService {
  /**
   * Adds a dataset and its dependencies to the map.
   *
   * @param store - The dataset store.
   * @param map - The map instance.
   * @param layer - The dataset to add.
   */
  static async addDataset(
    store: MapLayerStore,
    map: MapSimple,
    layer: IDataset,
  ) {
    try {
      const currentLists = DatasetService.getAllComponentsByType<IListViewUI>(
        store,
        'list',
      );
      const allComponentsOfType = findAllComponentsByType<IListViewUI>(
        layer,
        'list',
      );
      store.datasets[layer.id] = layer;
      allComponentsOfType.forEach((list, i) => {
        list.index = i + 1 + currentLists.length;
      });
      store.datasetIds.value.push(layer.id);

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
                if (isDatasetMapHasAddToMap(dep)) {
                  dep.addToMap(map); // add dependency dataset to map before current node
                  addedSet.add(depId);
                }
              }
            }
          }
          // Then add the node itself
          if (
            isDatasetMapHasAddToMap(node) &&
            typeof node.addToMap === 'function' &&
            !addedSet.has(node.id)
          ) {
            node.addToMap(map);
            addedSet.add(node.id);
          }
        },
        {},
      );
    } catch (error) {
      const datasetError = new DatasetError(
        `Failed to add dataset: ${layer.id}`,
        {
          context: { layerId: layer.id },
          cause: error,
          recoverable: true,
        },
      );
      errorHandler.handle(datasetError);
      throw datasetError;
    }
  }

  static async removeDataset(
    store: MapLayerStore,
    map: MapSimple,
    layer: IDataset,
  ) {
    delete store.datasets[layer.id];
    store.datasetIds.value = store.datasetIds.value.filter(
      (id) => id !== layer.id,
    );

    const removedSet = new Set<string>();

    traverseTree(
      layer,
      (node) => {
        // Remove this node from the map FIRST (before dependencies)
        if (isDatasetMapHasRemoveFromMap(node) && !removedSet.has(node.id)) {
          node.removeFromMap(map);
          removedSet.add(node.id);
        }
        // Then remove dependencies (if any)
        if (Array.isArray(node.dependsOn)) {
          for (const depId of node.dependsOn) {
            if (!removedSet.has(depId)) {
              const dep = store.datasets[depId];
              if (isDatasetMapHasRemoveFromMap(dep)) {
                dep.removeFromMap(map);
                removedSet.add(depId);
              }
            }
          }
        }
      },
      { direction: 'rtl' },
    );
  }

  static removeComponent(map: MapSimple, component: IDataset) {
    const parent = component.getParent() || component;

    if (isDatasetMapHasRemoveFromMap(component)) {
      component.removeFromMap(map);
    }
    applyToAllLeaves(parent, [
      (leaf) => {
        if (isDatasetMapHasRemoveFromMap(leaf)) {
          leaf.removeFromMap(map);
        }
      },
    ]);

    // Remove component from parent
    if (parent && isComposite(parent)) {
      parent.remove(component);
    }
  }

  static getAllComponentsByType<T extends IDataset = IDataset>(
    store: MapLayerStore,
    targetType: string,
  ): T[] {
    const views: T[] = [];
    Object.values(store.datasets).forEach((dataset) => {
      const allComponentsOfType = findAllComponentsByType<T>(
        dataset,
        targetType,
      );
      views.push(...allComponentsOfType);
    });
    return views;
  }
}
