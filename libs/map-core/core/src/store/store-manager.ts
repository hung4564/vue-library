/**
 * Framework-agnostic store manager
 * Handles store operations, map instance registry, and cleanup
 */

import {
  hasMapCollection,
  hasMapInstance,
  isMultiMapStore,
  type MapSimple,
} from '../types';
import type { IMapStoreAdapter, MapFCOnUseMap } from './interface';
import type {
  AddStoreOptions,
  DefaultValue,
  MapStore,
  MapStoreInternal,
  StoreCleanup,
} from './types';

/**
 * Map core events
 */
export const MAP_CORE_EVENT = {
  READY: 'ready',
} as const;

/**
 * Store manager class
 * Provides framework-agnostic store operations
 */
export class MapStoreManager {
  constructor(private adapter: IMapStoreAdapter) {}

  /**
   * Ensure map entry exists in root store
   */
  private ensureMapEntry(mapId: string): MapStore {
    const root = this.adapter.getRootStore();
    if (!root[mapId]) {
      this.log(mapId, 'debug', 'ensureMapEntry: create new entry');
      root[mapId] = {};
    }
    return root[mapId];
  }

  /**
   * Resolve default value (handle function factories)
   */
  private resolveDefaultValue<T>(defaultValue?: DefaultValue<T>): T {
    if (typeof defaultValue === 'function') {
      return (defaultValue as () => T)();
    }
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return {} as T;
  }

  /**
   * Collect maps from store
   */
  private collectMapsFromStore(mapId: string): MapSimple[] {
    const store = this.getMapStore(mapId);
    if (!store) {
      return [];
    }
    if (hasMapCollection(store)) {
      return store.maps;
    }
    if (hasMapInstance(store)) {
      return [store.map];
    }
    return [];
  }

  /**
   * Get map store by ID
   */
  getMapStore(id: string): MapStore | undefined {
    const entry = this.adapter.getRootStore()[id];
    if (!entry) {
      this.log(id, 'debug', 'getMapStore: entry not found');
    }
    return entry;
  }

  /**
   * Add store entry
   */
  addStore<T = Record<string, unknown>>(
    mapId: string,
    key: string,
    defaultValue?: DefaultValue<T>,
    options?: AddStoreOptions,
  ): T {
    const temp = this.ensureMapEntry(mapId);
    if (!(key in temp)) {
      this.log(mapId, 'debug', 'addStore: initialize key', key);
      temp[key] = this.resolveDefaultValue(defaultValue);
    } else {
      this.log(mapId, 'debug', 'addStore: reuse key', key);
    }
    if (options?.cleanup) {
      this.registerCleanup(mapId, key, options.cleanup);
    }
    return temp[key] as T;
  }

  /**
   * Get store entry
   */
  getStore<T>(mapId: string, key: string): T | undefined {
    const temp = this.getMapStore(mapId);
    if (!temp || !(key in temp)) {
      this.log(mapId, 'debug', 'getStore: missing key', key);
      return undefined;
    }
    return temp[key] as T;
  }

  /**
   * Check if store is multi-map
   */
  getIsMulti(id: string): boolean {
    return isMultiMapStore(this.getMapStore(id));
  }

  /**
   * Get maps from store
   */
  getMaps(id: string): MapSimple[] {
    return this.collectMapsFromStore(id);
  }

  /**
   * Get map instance(s)
   * If callback is provided, will wait for map to be ready
   */
  getMap(id: string, cb?: MapFCOnUseMap): MapSimple | MapSimple[] | undefined {
    const maps = this.collectMapsFromStore(id);
    if (maps.length) {
      if (cb) {
        maps.forEach((mapInstance) => cb(mapInstance));
      }
      return maps.length > 1 ? maps : maps[0];
    }

    if (cb) {
      this.log(id, 'debug', 'getMap: waiting for map instance');
      const emitter = this.adapter.getEventEmitter(id);
      const handler = () => {
        const readyMaps = this.collectMapsFromStore(id);
        if (readyMaps.length) {
          readyMaps.forEach((m) => cb(m));
          emitter.off(MAP_CORE_EVENT.READY, handler);
        }
      };
      emitter.on(MAP_CORE_EVENT.READY, handler);
    } else {
      this.log(id, 'debug', 'getMap: map instance not ready');
    }

    return undefined;
  }

  /**
   * Register cleanup function for a store key
   */
  registerCleanup(mapId: string, key: string, cleanup: StoreCleanup): void {
    const store = this.ensureMapEntry(mapId) as MapStoreInternal;
    store.__cleanup__ ??= {};
    store.__cleanup__[key] ??= [];
    store.__cleanup__[key].push(cleanup);
  }

  /**
   * Run cleanup functions
   */
  runCleanup(mapId: string, key?: string): void {
    const store = this.getMapStore(mapId) as MapStoreInternal | undefined;
    const mapCleanups = store?.__cleanup__;
    if (!mapCleanups) {
      return;
    }
    const targetKeys = key ? [key] : Object.keys(mapCleanups);
    targetKeys.forEach((cleanupKey) => {
      const cleanups = mapCleanups[cleanupKey] ?? [];
      delete mapCleanups[cleanupKey];
      cleanups.forEach((cleanup) => {
        try {
          const maybePromise = cleanup();
          if (
            maybePromise &&
            typeof (maybePromise as Promise<unknown>).catch === 'function'
          ) {
            (maybePromise as Promise<unknown>).catch((error) => {
              this.log(mapId, 'error', 'cleanup rejected', {
                key: cleanupKey,
                error,
              });
            });
          }
        } catch (error) {
          this.log(mapId, 'error', 'cleanup failed', {
            key: cleanupKey,
            error,
          });
        }
      });
    });
    if (!Object.keys(mapCleanups).length && store) {
      delete store.__cleanup__;
    }
  }

  /**
   * Initialize maps in store
   */
  initMaps(mapId: string, maps: MapSimple[]): void {
    this.log(mapId, 'debug', 'init maps', maps);
    const mapStore = this.ensureMapEntry(mapId);
    mapStore.maps = maps;
    mapStore.isMulti = maps.length > 1;
    delete mapStore.map;
    this.adapter.getEventEmitter(mapId).emit(MAP_CORE_EVENT.READY);
  }

  /**
   * Initialize single map in store
   */
  initMap(mapId: string, map: MapSimple): void {
    this.log(mapId, 'debug', 'init', map);
    const mapStore = this.ensureMapEntry(mapId);
    mapStore.map = map;
    mapStore.isMulti = false;
    delete mapStore.maps;
    this.adapter.getEventEmitter(mapId).emit(MAP_CORE_EVENT.READY);
  }

  /**
   * Remove map from store
   */
  removeMap(mapId: string): void {
    this.log(mapId, 'debug', 'removeMap');
    this.runCleanup(mapId);
    const root = this.adapter.getRootStore();
    delete root[mapId];
  }

  /**
   * Destroy scoped store
   */
  destroyScopedStore(mapId: string, key: string): void {
    const store = this.getMapStore(mapId);
    if (store && key in store) {
      delete store[key];
      this.runCleanup(mapId, key);
    }
  }

  /**
   * Log message (if logger is provided)
   */
  private log(
    mapId: string,
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    data?: any,
  ): void {
    if (this.adapter.log) {
      this.adapter.log(mapId, level, message, data);
    }
  }
}
