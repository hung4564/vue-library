import { errorHandler, type MapSimple } from '@hungpvq/map-core';
import { loggerFactory, runWithFunctionLog } from '@hungpvq/shared-log';
import { DatasetError } from '../errors';
import type { IDataset } from '../interfaces/dataset.base';
import type { IListViewUI } from '../model/list/types';
import { findAllComponentsByType } from '../model/visitors/helpers';
import { traverseTree } from '../model/visitors/traverse';
import {
  isComposite,
  isDatasetMapHasAddToMap,
  isDatasetMapHasRemoveFromMap,
} from '../utils/check';

export type DatasetStoreLike = {
  datasets: Record<string, IDataset>;
  datasetIds: { value: string[] };
};

const datasetLogger = loggerFactory
  .createLogger()
  .setNamespace('map:dataset', 2);

function datasetCtx(mapId: string, layer: IDataset, span: string, fn: string) {
  return {
    fn,
    span,
    mapId,
    datasetId: layer.id,
    datasetName: layer.getName?.(),
    datasetType: layer.type,
  };
}

export class DatasetService {
  static async addDataset(
    store: DatasetStoreLike,
    map: MapSimple,
    layer: IDataset,
  ) {
    return loggerFactory.ensureActionContext(
      datasetCtx(map.id, layer, 'dataset.add', 'addDataset'),
      async () =>
        runWithFunctionLog(
          datasetLogger,
          datasetCtx(map.id, layer, 'dataset.add', 'addDataset'),
          async () => {
            const log = datasetLogger.with(
              datasetCtx(map.id, layer, 'dataset.add', 'addDataset'),
            );
            try {
              const currentLists =
                DatasetService.getAllComponentsByType<IListViewUI>(
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
              log.debug(
                'Dataset registered in store and list indexes assigned.',
                {
                  listComponentCount: allComponentsOfType.length,
                  existingListCount: currentLists.length,
                },
              );

              const addedSet = new Set<string>();

              traverseTree(
                layer,
                (node) => {
                  if (Array.isArray(node.dependsOn)) {
                    for (const depId of node.dependsOn) {
                      if (addedSet.has(depId)) {
                        log.debug(
                          'Dependency addToMap skipped because it was already added.',
                          { dependencyId: depId },
                        );
                        continue;
                      }
                      const dep = store.datasets[depId];
                      if (isDatasetMapHasAddToMap(dep)) {
                        log.debug(
                          'Adding dependency dataset to the map before the node.',
                          { dependencyId: depId },
                        );
                        dep.addToMap(map);
                        addedSet.add(depId);
                      } else {
                        log.debug(
                          'Dependency addToMap skipped because the dependency is missing or has no addToMap.',
                          { dependencyId: depId },
                        );
                      }
                    }
                  }
                  if (
                    isDatasetMapHasAddToMap(node) &&
                    typeof node.addToMap === 'function' &&
                    !addedSet.has(node.id)
                  ) {
                    log.debug(`Adding dataset ${node.type} to the map.`, {
                      nodeId: node.id,
                      nodeType: node.type,
                    });
                    node.addToMap(map);
                    addedSet.add(node.id);
                  } else if (addedSet.has(node.id)) {
                    log.debug(
                      'Node addToMap skipped because it was already added as a dependency.',
                      { nodeId: node.id },
                    );
                  }
                },
                {},
              );
              log.debug('Dataset add finished.', {
                mapLayerCount: addedSet.size,
              });
            } catch (error) {
              log.error('Failed to add dataset to store and map.', {
                errorName: error instanceof Error ? error.name : undefined,
                errorMessage:
                  error instanceof Error ? error.message : String(error),
              });
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
          },
        ),
    );
  }

  static async removeDataset(
    store: DatasetStoreLike,
    map: MapSimple,
    layer: IDataset,
  ) {
    return loggerFactory.ensureActionContext(
      datasetCtx(map.id, layer, 'dataset.remove', 'removeDataset'),
      async () =>
        runWithFunctionLog(
          datasetLogger,
          datasetCtx(map.id, layer, 'dataset.remove', 'removeDataset'),
          async () => {
            const log = datasetLogger.with(
              datasetCtx(map.id, layer, 'dataset.remove', 'removeDataset'),
            );
            delete store.datasets[layer.id];
            store.datasetIds.value = store.datasetIds.value.filter(
              (id) => id !== layer.id,
            );
            log.debug(
              'Dataset removed from store; removing map layers depth-first.',
            );

            const removedSet = new Set<string>();

            traverseTree(
              layer,
              (node) => {
                if (
                  isDatasetMapHasRemoveFromMap(node) &&
                  !removedSet.has(node.id)
                ) {
                  log.debug('Removing dataset node from the map.', {
                    nodeId: node.id,
                    nodeType: node.type,
                  });
                  node.removeFromMap(map);
                  removedSet.add(node.id);
                }
                if (Array.isArray(node.dependsOn)) {
                  for (const depId of node.dependsOn) {
                    if (removedSet.has(depId)) {
                      log.debug(
                        'Dependency removeFromMap skipped because it was already removed.',
                        { dependencyId: depId },
                      );
                      continue;
                    }
                    const dep = store.datasets[depId];
                    if (isDatasetMapHasRemoveFromMap(dep)) {
                      log.debug('Removing dependency dataset from the map.', {
                        dependencyId: depId,
                      });
                      dep.removeFromMap(map);
                      removedSet.add(depId);
                    }
                  }
                }
              },
              { direction: 'rtl' },
            );
            log.debug('Dataset remove finished.', {
              mapLayerCount: removedSet.size,
            });
          },
        ),
    );
  }

  static removeComponent(map: MapSimple, component: IDataset) {
    const parent = component.getParent() || component;
    const log = datasetLogger.with({
      fn: 'removeComponent',
      span: 'dataset.remove',
      mapId: map.id,
      datasetId: component.id,
      datasetType: component.type,
    });
    log.debug(
      'Removing component map layers (RTL traverse; parent composite update if needed).',
      { parentId: parent.id },
    );

    // RTL only: avoid calling removeFromMap twice (component then traverse).
    traverseTree(
      parent,
      (node) => {
        if (isComposite(node)) return;
        if (isDatasetMapHasRemoveFromMap(node)) {
          node.removeFromMap(map);
        }
      },
      { direction: 'rtl' },
    );

    if (parent && isComposite(parent)) {
      parent.remove(component);
      log.debug('Component detached from composite parent.', {
        parentId: parent.id,
      });
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
