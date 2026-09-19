/**
 * React-specific store implementation using MapStoreManager from @hungpvq/map-core
 */

import type { MapFCOnUseMap, MapSimple } from '@hungpvq/map-core';
import {
  isUsableMapId,
  MAP_PLATFORM_HOST,
  MAP_STORE_KEY,
  MapStoreManager,
  registerMapAccessor,
  registerMapReadySubscriber,
  registerMapStoreCleanupRegistrar,
  type AddStoreOptions,
  type MapStore,
} from '@hungpvq/map-core';
import { ReactMapStoreAdapter } from './react-adapter';

/**
 * Store adapter instance
 */
const storeAdapter = new ReactMapStoreAdapter();

/**
 * Store manager instance
 */
const storeManager = new MapStoreManager(storeAdapter);

const platformHost = { hostId: MAP_PLATFORM_HOST.REACT_MAP_CORE } as const;
registerMapAccessor((id, cb) => storeManager.getMap(id, cb), platformHost);
registerMapReadySubscriber(
  (id, cb) => storeManager.subscribeMapReady(id, cb),
  platformHost,
);
registerMapStoreCleanupRegistrar(
  (mapId, key, cleanup) => storeManager.registerCleanup(mapId, key, cleanup),
  platformHost,
);

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

export type MapScopedStoreOptions = AddStoreOptions;

type MapStoreKey = (typeof MAP_STORE_KEY)[keyof typeof MAP_STORE_KEY];
type MapScopedKey = MapStoreKey | (string & object);

export function createMapScopedStore<T>(
  mapId: string,
  key: MapScopedKey,
  factory: () => T,
  options?: MapScopedStoreOptions,
): T {
  if (!isUsableMapId(mapId)) {
    throw new Error('mapId is required');
  }
  const existing = storeManager.peekStore<T>(mapId, key as string);
  if (existing !== undefined) {
    return existing;
  }
  return storeManager.addStore(mapId, key as string, factory, options);
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
