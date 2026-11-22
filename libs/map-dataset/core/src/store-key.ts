/**
 * Map-scoped store key for the dataset list / {@link DatasetService} bag.
 * Owned by `@hungpvq/map-dataset` (not `MAP_STORE_KEY` in map-core).
 * Vue/React adapters and debug peek must use this constant — changing the
 * string value is a SemVer **major**.
 */
export const MAP_DATASET_STORE_KEY = 'dataset' as const;

export type MapDatasetStoreKey = typeof MAP_DATASET_STORE_KEY;
