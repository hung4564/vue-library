/**
 * Vue-specific store implementation using MapStoreManager from @hungpvq/map-core
 */

import type { MapFCOnUseMap, MapSimple } from '@hungpvq/map-core';
import {
  MAP_STORE_KEY,
  MapStoreManager,
  registerMapAccessor,
  type AddStoreOptions,
  type MapStore,
} from '@hungpvq/map-core';
import { VueMapStoreAdapter } from './vue-adapter';
export { useMapGLobalStore } from './global-store';

const storeAdapter = new VueMapStoreAdapter();
const storeManager = new MapStoreManager(storeAdapter);
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
 * Check if store is multi-map
 */
export function getIsMulti(id: string): boolean {
  return storeManager.getIsMulti(id);
}

/**
 * Get maps from store
 */
export function getMaps(id: string): MapSimple[] {
  return storeManager.getMaps(id);
}

/**
 * Get map instance(s)
 */
export function getMap(
  id: string,
  cb?: MapFCOnUseMap,
): MapSimple | MapSimple[] | undefined {
  return storeManager.getMap(id, cb);
}

/**
 * Create scoped store
 */
export type MapScopedStoreOptions = AddStoreOptions;

type MapStoreKey = (typeof MAP_STORE_KEY)[keyof typeof MAP_STORE_KEY];
type MapScopedKey = MapStoreKey | (string & object);

export function createMapScopedStore<T>(
  mapId: string,
  key: MapScopedKey,
  factory: () => T,
  options?: MapScopedStoreOptions,
) {
  const existing = storeManager.peekStore<T>(mapId, key as string);
  if (existing !== undefined) {
    return existing;
  }
  return storeManager.addStore<T>(mapId, key as string, factory, options);
}

/**
 * Destroy scoped store
 */
export function destroyMapScopedStore(mapId: string, key: MapScopedKey) {
  storeManager.destroyScopedStore(mapId, key as string);
}

/**
 * Vue hook: useMapStore
 */
export const useMapStore = (mapId: string) => {
  return {
    getIsMulti(): boolean {
      return storeManager.getIsMulti(mapId);
    },
    getMaps(): MapSimple[] | undefined {
      const maps = storeManager.getMaps(mapId);
      return maps.length ? maps : undefined;
    },
    getMap(cb?: MapFCOnUseMap) {
      return storeManager.getMap(mapId, cb);
    },
  };
};

/**
 * Vue hook: useMapContainer
 */
export const useMapContainer = (mapId: string) => {
  return {
    initMaps(maps: MapSimple[]) {
      storeManager.initMaps(mapId, maps);
    },
    initMap(map: MapSimple) {
      storeManager.initMap(mapId, map);
    },
    removeMap() {
      storeManager.removeMap(mapId);
    },
  };
};
