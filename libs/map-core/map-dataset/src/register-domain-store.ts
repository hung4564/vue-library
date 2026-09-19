import {
  ensureMapDomainStore,
  getMap,
  logHelper,
  registerMapDomainStoreFactory,
} from '@hungpvq/map-core';
import {
  createDefaultMapDatasetStore,
  type MapDatasetStore,
} from './dataset-store';
import { logger } from './logger';
import { DatasetService } from './services/dataset.service';
import { MAP_DATASET_STORE_KEY } from './store-key';

async function clearDatasetsOnRemoveMap(
  mapId: string,
  store: MapDatasetStore,
): Promise<void> {
  const ids = [...store.datasetIds.value];
  if (!ids.length) {
    store.listeners.clear();
    return;
  }
  const map = getMap(mapId);
  logHelper(logger, mapId, 'store')
    .with({ fn: 'clearDatasetsOnRemoveMap', span: 'store.clear' })
    .debug('clear datasets on removeMap', {
      count: ids.length,
    });
  for (const id of ids) {
    const layer = store.datasets[id];
    if (!layer) continue;
    if (map) {
      await DatasetService.removeDataset(store, map, layer);
    } else {
      delete store.datasets[id];
      store.datasetIds.value = store.datasetIds.value.filter((x) => x !== id);
    }
  }
  store.listeners.clear();
}

registerMapDomainStoreFactory(MAP_DATASET_STORE_KEY, {
  create: () => createDefaultMapDatasetStore(),
  cleanup: (mapId, store) =>
    clearDatasetsOnRemoveMap(mapId, store as MapDatasetStore),
});

/** Get or create the dataset list bag for `mapId`. */
export function ensureMapDatasetStore(mapId: string): MapDatasetStore {
  return ensureMapDomainStore<MapDatasetStore>(mapId, MAP_DATASET_STORE_KEY);
}
