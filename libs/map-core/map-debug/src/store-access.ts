import { GlobalStoreService } from '@hungpvq/shared-store';

const MAP_CORE_KEY = 'map:core';

export type MapCoreBag = Record<string, Record<string, unknown>>;

/** Process-wide mapId keys under `map:core`. */
export function listMapIds(): string[] {
  const root = GlobalStoreService.getInstance().getState()[
    MAP_CORE_KEY
  ] as MapCoreBag | undefined;
  return Object.keys(root ?? {}).sort();
}

/** Peek a map-scoped store bag by key. */
export function getMapScopedStore<T = unknown>(
  mapId: string,
  key: string,
): T | undefined {
  const root = GlobalStoreService.getInstance().getState()[
    MAP_CORE_KEY
  ] as MapCoreBag | undefined;
  const bag = root?.[mapId];
  if (!bag || typeof bag !== 'object') return undefined;
  return bag[key] as T | undefined;
}

export type DatasetStoreLike = {
  datasets: Record<string, unknown>;
  datasetIds: { value: string[] };
};

/**
 * Dataset list bag under each mapId.
 * Value must stay equal to `MAP_DATASET_STORE_KEY` from `@hungpvq/map-dataset`
 * (not imported here — map-dataset is an optional peer of map-debug root).
 */
const DATASET_STORE_KEY = 'dataset' as const;

export function getDatasetStore(mapId: string): DatasetStoreLike | undefined {
  return getMapScopedStore<DatasetStoreLike>(mapId, DATASET_STORE_KEY);
}
