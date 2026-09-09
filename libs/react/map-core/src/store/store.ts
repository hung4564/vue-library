/**
 * React-specific store implementation using MapStoreManager from @hungpvq/map-core
 */

import type { MapFCOnUseMap, MapSimple } from '@hungpvq/map-core';
import {
  MapStoreManager,
  registerMapAccessor,
  type AddStoreOptions,
  type MapStore,
} from '@hungpvq/map-core';
import { ReactMapStoreAdapter } from './react-adapter';
import { setStoreManager, type MapScopedKey } from './store-utils';
export {
  getMapGlobalStore,
  useMapGlobalStore,
  MapGlobalStoreProvider,
} from './global-store';
export {
  createMapScopedStore,
  type MapScopedStoreOptions,
} from './store-utils';

/**
 * Store adapter instance
 */
const storeAdapter = new ReactMapStoreAdapter();

/**
 * Store manager instance
 */
const storeManager = new MapStoreManager(storeAdapter);

// Set store manager reference for store-utils
setStoreManager(storeManager);
registerMapAccessor((id, cb) => storeManager.getMap(id, cb));

/**
 * Get map store by ID
 */
export function getMapStore(id: string): MapStore | undefined {
  return storeManager.getMapStore(id);
}

/**
 * Add store entry
 */
export function addStore<T = Record<string, unknown>>(
  mapId: string,
  key: string,
  defaultValue?: T | (() => T),
  options?: AddStoreOptions,
): T {
  return storeManager.addStore<T>(mapId, key, defaultValue, options);
}

/**
 * Get store entry
 */
export function getStore<T>(mapId: string, key: string): T | undefined {
  return storeManager.getStore<T>(mapId, key);
}

/**
 * Get map instance
 */
export function getMap(
  id: string,
  cb?: MapFCOnUseMap,
): MapSimple | undefined {
  return storeManager.getMap(id, cb);
}

/**
 * Destroy scoped store
 */
export function destroyMapScopedStore(mapId: string, key: MapScopedKey) {
  storeManager.destroyScopedStore(mapId, key as string);
}

/**
 * React hook: useMapStore
 */
export const useMapStore = (mapId: string) => {
  return {
    getMap(cb?: MapFCOnUseMap) {
      return storeManager.getMap(mapId, cb);
    },
  };
};

/**
 * React hook: useMapContainer
 */
export const useMapContainer = (mapId: string) => {
  return {
    initMap(map: MapSimple) {
      storeManager.initMap(mapId, map);
    },
    removeMap() {
      storeManager.removeMap(mapId);
    },
  };
};
