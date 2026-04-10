/**
 * Store utility functions
 * Separated to avoid circular dependencies
 */

import { MAP_STORE_KEY, type AddStoreOptions } from '@hungpvq/map-core';

export type MapScopedStoreOptions = AddStoreOptions;

type MapStoreKey = (typeof MAP_STORE_KEY)[keyof typeof MAP_STORE_KEY];
export type MapScopedKey = MapStoreKey | (string & object);

/**
 * Store manager reference - will be set by store.ts
 */
let storeManagerRef: any = null;

/**
 * Set store manager reference (called from store.ts)
 */
export function setStoreManager(manager: any) {
  storeManagerRef = manager;
}

/**
 * Create scoped store
 */
export function createMapScopedStore<T>(
  mapId: string,
  key: MapScopedKey,
  factory: () => T,
  options?: MapScopedStoreOptions,
) {
  if (!storeManagerRef) {
    throw new Error('Store manager not initialized');
  }
  return storeManagerRef.addStore<T>(mapId, key as string, factory, options);
}
