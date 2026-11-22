import type { IDataset } from './interfaces/dataset.base';

/**
 * Framework-agnostic dataset list bag on `map:core[mapId][MAP_DATASET_STORE_KEY]`.
 * `datasetIds` uses a `.value` box so Vue `Ref` and plain objects both work with
 * {@link DatasetService}; do **not** put framework Refs on this bag.
 */
export type MapDatasetStore = {
  datasets: Record<string, IDataset>;
  datasetIds: { value: string[] };
  allLayerShow: boolean;
  version: number;
  listeners: Set<() => void>;
};

export function createDefaultMapDatasetStore(): MapDatasetStore {
  return {
    datasets: {},
    datasetIds: { value: [] },
    allLayerShow: true,
    version: 0,
    listeners: new Set(),
  };
}

/** Bump version and notify subscribers (React / Vue tick hooks). */
export function notifyMapDatasetStore(store: MapDatasetStore): void {
  store.version += 1;
  store.listeners.forEach((listener) => listener());
}
