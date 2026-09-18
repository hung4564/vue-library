/**
 * Framework-agnostic store manager
 * Handles store operations, map instance registry, and cleanup
 */

import { MapInitializationError } from '../errors';
import { UniversalRegistry } from '../registry/universal-registry';
import { hasMapInstance, type MapSimple } from '../types';
import type { IMapStoreAdapter, MapFCOnUseMap } from './interface';
import { getMapCoreMetaStore } from './map-core-meta';
import { isUsableMapId } from './is-usable-map-id';
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

function getRemovedMapIds(): Set<string> {
  return getMapCoreMetaStore().removedMapIds;
}

function assertMapId(mapId: string): asserts mapId is string {
  if (!isUsableMapId(mapId)) {
    throw new Error('mapId is required');
  }
}

/**
 * Store manager class
 * Provides framework-agnostic store operations
 */
export class MapStoreManager {
  constructor(private adapter: IMapStoreAdapter) {}

  /** Root bag; drops legacy empty-string map entries from prior bugs. */
  private getRoot(): Record<string, MapStore> {
    const root = this.adapter.getRootStore();
    if (Object.prototype.hasOwnProperty.call(root, '')) {
      delete root[''];
    }
    return root;
  }

  /**
   * Ensure map entry exists in root store
   */
  private ensureMapEntry(mapId: string): MapStore {
    assertMapId(mapId);
    const root = this.getRoot();
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

  private getMapFromStore(mapId: string): MapSimple | undefined {
    const store = this.getMapStore(mapId);
    return hasMapInstance(store) ? store.map : undefined;
  }

  /**
   * Get map store by ID
   */
  getMapStore(id: string): MapStore | undefined {
    const root = this.getRoot();
    if (!id) {
      return undefined;
    }
    const entry = root[id];
    if (!entry) {
      this.log(id, 'debug', 'getMapStore: entry not found');
    }
    return entry;
  }

  /**
   * Add store entry
   */
  peekStore<T>(mapId: string, key: string): T | undefined {
    const root = this.getRoot();
    if (!mapId) {
      return undefined;
    }
    const temp = root[mapId];
    if (!temp || !(key in temp)) {
      return undefined;
    }
    return temp[key] as T;
  }

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
   * Subscribe to map READY. Invokes `cb` synchronously when the map is already
   * live; otherwise waits for `initMap`. Tombstoned ids (after `removeMap`)
   * never wait. Returns an unsubscribe that removes the READY listener.
   */
  subscribeMapReady(id: string, cb: MapFCOnUseMap): () => void {
    if (!id) {
      this.log(id, 'debug', 'subscribeMapReady: skip empty mapId');
      return () => undefined;
    }
    const map = this.getMapFromStore(id);
    if (map) {
      cb(map);
      return () => undefined;
    }

    if (getRemovedMapIds().has(id)) {
      this.log(id, 'debug', 'subscribeMapReady: skip wait after removeMap');
      return () => undefined;
    }

    this.log(id, 'debug', 'subscribeMapReady: waiting for map instance');
    const emitter = this.adapter.getEventEmitter(id);
    const handler = () => {
      const ready = this.getMapFromStore(id);
      if (ready) {
        cb(ready);
        emitter.off(MAP_CORE_EVENT.READY, handler);
      }
    };
    emitter.on(MAP_CORE_EVENT.READY, handler);
    return () => {
      emitter.off(MAP_CORE_EVENT.READY, handler);
    };
  }

  /**
   * Get map instance.
   * If callback is provided, will wait for map to be ready — unless the mapId
   * was removed (tombstoned) and has not been re-init'd.
   */
  getMap(id: string, cb?: MapFCOnUseMap): MapSimple | undefined {
    if (!id) {
      return undefined;
    }
    const map = this.getMapFromStore(id);
    if (map) {
      cb?.(map);
      return map;
    }

    if (cb) {
      this.subscribeMapReady(id, cb);
    } else {
      this.log(id, 'debug', 'getMap: map instance not ready');
    }

    return undefined;
  }

  /**
   * Register cleanup function for a store key
   */
  registerCleanup(mapId: string, key: string, cleanup: StoreCleanup): void {
    if (!isUsableMapId(mapId)) {
      this.log(mapId, 'debug', 'registerCleanup: skip empty mapId');
      return;
    }
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
   * Initialize single map in store.
   * One mapId may only hold one live map instance at a time.
   */
  initMap(mapId: string, map: MapSimple): void {
    getRemovedMapIds().delete(mapId);
    const existing = this.getMapFromStore(mapId);
    if (existing && existing !== map) {
      throw new MapInitializationError(
        `mapId "${mapId}" already has a live map instance`,
        { context: { mapId } },
      );
    }
    this.log(mapId, 'debug', 'init', map);
    const mapStore = this.ensureMapEntry(mapId);
    mapStore.map = map;
    this.adapter.getEventEmitter(mapId).emit(MAP_CORE_EVENT.READY);
  }

  /**
   * Remove map from store
   */
  removeMap(mapId: string): void {
    if (!mapId) {
      return;
    }
    this.log(mapId, 'debug', 'removeMap');
    this.runCleanup(mapId);
    UniversalRegistry.clearMap(mapId);
    const root = this.getRoot();
    delete root[mapId];
    getRemovedMapIds().add(mapId);
  }

  /**
   * Destroy scoped store
   */
  destroyScopedStore(mapId: string, key: string): void {
    const store = this.getMapStore(mapId);
    if (store && key in store) {
      this.runCleanup(mapId, key);
      delete store[key];
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
