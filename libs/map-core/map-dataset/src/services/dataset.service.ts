import { errorHandler, type MapSimple } from '@hungpvq/map-core';
import type { IDataset } from '../interfaces';
import type { IListViewUI } from '../model/list/types';
import {
  applyToAllLeaves,
  findAllComponentsByType,
  traverseTree,
} from '../model/visitors';
import { DatasetError } from '../errors';
import {
  isComposite,
  isDatasetMapHasAddToMap,
  isDatasetMapHasRemoveFromMap,
} from '../utils/check';

export type DatasetStoreLike = {
  datasets: Record<string, IDataset>;
  datasetIds: { value: string[] };
};

export class DatasetService {
  static async addDataset(
    store: DatasetStoreLike,
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

      const addedSet = new Set<string>();

      traverseTree(
        layer,
        (node) => {
          if (Array.isArray(node.dependsOn)) {
            for (const depId of node.dependsOn) {
              if (!addedSet.has(depId)) {
                const dep = store.datasets[depId];
                if (isDatasetMapHasAddToMap(dep)) {
                  dep.addToMap(map);
                  addedSet.add(depId);
                }
              }
            }
          }
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
    store: DatasetStoreLike,
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
        if (isDatasetMapHasRemoveFromMap(node) && !removedSet.has(node.id)) {
          node.removeFromMap(map);
          removedSet.add(node.id);
        }
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

    if (parent && isComposite(parent)) {
      parent.remove(component);
    }
  }

  static getAllComponentsByType<T extends IDataset = IDataset>(
    store: DatasetStoreLike,
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
