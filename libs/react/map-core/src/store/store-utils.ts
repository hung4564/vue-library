import type { AddStoreOptions, MapStoreManager } from '@hungpvq/map-core';
import { MAP_STORE_KEY } from '@hungpvq/map-core';

export type MapScopedStoreOptions = AddStoreOptions;

type MapStoreKey = (typeof MAP_STORE_KEY)[keyof typeof MAP_STORE_KEY];
export type MapScopedKey = MapStoreKey | (string & object);

let storeManagerRef: MapStoreManager | null = null;

export function setStoreManager(manager: MapStoreManager) {
  storeManagerRef = manager;
}

export function createMapScopedStore<T>(
  mapId: string,
  key: MapScopedKey,
  factory: () => T,
  options?: MapScopedStoreOptions,
): T {
  if (!storeManagerRef) {
    throw new Error('Store manager not initialized');
  }
  return storeManagerRef.addStore(mapId, key as string, factory, options);
}
