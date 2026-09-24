import {
  getMapDebugStore as getMapDebugStoreCore,
  MAP_DEBUG_STORE_KEY,
  type MapDebugStore as MapDebugStoreCore,
} from '@hungpvq/map-core/devtools';

import type { DatasetDebugApi } from './types';

export { MAP_DEBUG_STORE_KEY };

/** Process-wide debug bag — same object as {@link getMapDebugStoreCore}. */
export type MapDebugStore = Omit<MapDebugStoreCore, 'dataset'> & {
  /** Dataset Inspector + console API (`installDatasetDebug`). */
  dataset?: DatasetDebugApi;
};

export function getMapDebugStore(): MapDebugStore {
  return getMapDebugStoreCore() as MapDebugStore;
}
