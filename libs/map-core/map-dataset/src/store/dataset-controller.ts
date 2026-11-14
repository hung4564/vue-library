import {
  getMap,
  isUsableMapId,
  logHelper,
  type MapSimple,
} from '@hungpvq/map-core';

import {
  notifyMapDatasetStore,
  type MapDatasetStore,
} from '../dataset-store';
import type { DeletePolicy, IDataset } from '../interfaces/dataset.base';
import { logger } from '../logger';
import {
  findAllComponentsByDeletePolicy,
  findRoot,
} from '../model/visitors/helpers';
import { ensureMapDatasetStore } from '../register-domain-store';
import { DatasetService } from '../services/dataset.service';
import {
  isComposite,
  isDatasetMapHasRemoveFromMap,
} from '../utils/check';

const EMPTY_DATASET_IDS: { value: string[] } = { value: [] };

/**
 * Remove a dataset component according to its configured `deletePolicy`:
 * - 'self': Only removes itself from the map and detaches from parent.
 * - 'children' / 'subtree': Removes itself and all its descendant nodes.
 * - 'root-on-empty': Removes itself and descendants; if no components of the same type remain in root, deletes root dataset too.
 * - 'cascade' / 'root': Immediately removes the entire root dataset and all related layers.
 */
export async function removeDatasetComponentWithPolicy(
  store: MapDatasetStore | undefined,
  map: MapSimple,
  component: IDataset,
): Promise<void> {
  const root = findRoot(component);
  const policy: DeletePolicy =
    component.deletePolicy ??
    (component as any).config?.deletePolicy ??
    (component.getParent() ? 'self' : 'cascade');

  if (policy === 'cascade' || policy === 'root') {
    if (store && root && store.datasets[root.id]) {
      await DatasetService.removeDataset(store, map, root);
    } else {
      DatasetService.removeComponent(map, component);
    }
    if (store) notifyMapDatasetStore(store);
    return;
  }

  if (policy === 'self') {
    const parent = component.getParent();
    if (isDatasetMapHasRemoveFromMap(component)) {
      component.removeFromMap(map);
    }
    if (parent && isComposite(parent)) {
      parent.remove(component);
    }
    if (store) notifyMapDatasetStore(store);
    return;
  }

  if (policy === 'children' || policy === 'subtree') {
    DatasetService.removeComponent(map, component);
    if (store) notifyMapDatasetStore(store);
    return;
  }

  // policy === 'root-on-empty'
  DatasetService.removeComponent(map, component);

  if (store && root && store.datasets[root.id]) {
    const deleteGroup = (component as any).config?.deleteGroup;
    const remaining = findAllComponentsByDeletePolicy(
      root,
      'root-on-empty',
      deleteGroup,
    );

    if (remaining.length === 0) {
      await DatasetService.removeDataset(store, map, root);
    }
  }
  if (store) notifyMapDatasetStore(store);
}

export type MapDatasetController = ReturnType<typeof createMapDatasetController>;

/**
 * Framework-agnostic controller for map datasets.
 * Encapsulates all CRUD and deletePolicy logic for datasets on a map.
 */
export function createMapDatasetController(
  mapIdSource: string | (() => string | undefined),
) {
  const getMapId =
    typeof mapIdSource === 'function' ? mapIdSource : () => mapIdSource;

  function getStore(): MapDatasetStore | undefined {
    const id = getMapId();
    if (!isUsableMapId(id)) return undefined;
    return ensureMapDatasetStore(id);
  }

  function getDatasets(): IDataset[] {
    const store = getStore();
    if (!store) return [];
    return store.datasetIds.value
      .map((id) => store.datasets[id])
      .filter((d): d is IDataset => Boolean(d));
  }

  function getDatasetIds(): { value: string[] } {
    return getStore()?.datasetIds ?? EMPTY_DATASET_IDS;
  }

  function getAllComponentsByType<T extends IDataset>(targetType: string): T[] {
    const store = getStore();
    if (!store) return [];
    return DatasetService.getAllComponentsByType<T>(store, targetType);
  }

  async function addDataset(layer: IDataset): Promise<void> {
    const id = getMapId();
    if (!isUsableMapId(id)) return;
    const store = ensureMapDatasetStore(id);

    getMap(id, async (map: MapSimple) => {
      await DatasetService.addDataset(store, map, layer);
      notifyMapDatasetStore(store);
    });

    logHelper(logger, id, 'store')
      .with({ fn: 'addDataset', span: 'store.add' })
      .debug('addDataset', {
        datasetId: layer.id,
        name: layer.getName?.() ?? layer.id,
      });
  }

  async function removeDataset(layer: IDataset): Promise<void> {
    const id = getMapId();
    if (!isUsableMapId(id)) return;
    const store = ensureMapDatasetStore(id);

    getMap(id, async (map: MapSimple) => {
      await DatasetService.removeDataset(store, map, layer);
      notifyMapDatasetStore(store);
    });

    logHelper(logger, id, 'store')
      .with({ fn: 'removeDataset', span: 'store.remove' })
      .debug('removeDataset', {
        store,
        dataset: layer,
      });
  }

  function removeComponent(component: IDataset): void {
    const id = getMapId();
    if (!isUsableMapId(id)) return;
    const store = ensureMapDatasetStore(id);

    logHelper(logger, id, 'store')
      .with({ fn: 'removeComponent', span: 'store.remove' })
      .debug('removeComponent', component);

    getMap(id, async (map: MapSimple) => {
      await removeDatasetComponentWithPolicy(store, map, component);
    });
  }

  function subscribe(listener: () => void): () => void {
    const id = getMapId();
    if (!isUsableMapId(id)) return () => undefined;
    const store = ensureMapDatasetStore(id);
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }

  function getVersion(): number {
    return getStore()?.version ?? 0;
  }

  return {
    getStore,
    getDatasets,
    getDatasetIds,
    getAllComponentsByType,
    addDataset,
    removeDataset,
    removeComponent,
    subscribe,
    getVersion,
  };
}
