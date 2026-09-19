import type { DatasetDebugApi } from './types';
import {
  MAP_DEBUG_STORE_KEY,
  getMapDebugStore as getMapDebugStoreCore,
  type MapDebugStore as MapDebugStoreCore,
} from '@hungpvq/map-core/devtools';

export { MAP_DEBUG_STORE_KEY };

/** Process-wide debug bag — same object as {@link getMapDebugStoreCore}. */
export type MapDebugStore = Omit<MapDebugStoreCore, 'dataset'> & {
  /** Dataset Inspector + console API (`installDatasetDebug`). */
  dataset?: DatasetDebugApi;
};

export function getMapDebugStore(): MapDebugStore {
  return getMapDebugStoreCore() as MapDebugStore;
}
