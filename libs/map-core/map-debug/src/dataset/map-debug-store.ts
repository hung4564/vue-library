import { getOrCreateStore } from '@hungpvq/shared-store';
import type { DatasetDebugApi } from './types';

/** Process-wide debug bag (shared across duplicate package copies). */
export const MAP_DEBUG_STORE_KEY = 'map:debug';

export type MapDebugStore = {
  /** Dataset Inspector + console API (`installDatasetDebug`). */
  dataset?: DatasetDebugApi;
};

export function getMapDebugStore(): MapDebugStore {
  return getOrCreateStore<MapDebugStore>(MAP_DEBUG_STORE_KEY, () => ({}));
}
