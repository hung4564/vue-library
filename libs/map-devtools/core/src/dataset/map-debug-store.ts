import {
  getMapDebugStore as getMapDebugStoreCore,
  type MapDebugStore as MapDebugStoreCore,
} from '../core/map-debug-store';
import type { DatasetDebugApi } from './types';

/** Process-wide debug bag — same object as {@link getMapDebugStoreCore}. */
export type MapDebugStore = Omit<MapDebugStoreCore, 'dataset'> & {
  /** Dataset Inspector + console API (`installDatasetDebug`). */
  dataset?: DatasetDebugApi;
};

export function getMapDebugStore(): MapDebugStore {
  return getMapDebugStoreCore() as MapDebugStore;
}
