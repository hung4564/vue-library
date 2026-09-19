import { getOrCreateStore } from '@hungpvq/shared-store';
import type { DataStoreLogAdapter, LogDataStore } from '@hungpvq/shared-log';

/** Process-wide debug bag (shared across duplicate package copies). */
export const MAP_DEBUG_STORE_KEY = 'map:debug';

/**
 * Options for creating the Devtools {@link LogDataStore}.
 * Stored on {@link MapDebugStore.logStoreOptions}.
 */
export type MapDebugLogStoreOptions = {
  /** Default `'indexeddb'`. Ignored when {@link store} is set. */
  kind?: 'memory' | 'indexeddb';
  /**
   * Cap for MemoryLogDataStore only (newest retained). Default `10_000`.
   * Ignored for IndexedDB and custom stores.
   */
  limit?: number;
  /** Custom {@link LogDataStore} — takes precedence over `kind`. */
  store?: LogDataStore;
  /** IndexedDB only. */
  dbName?: string;
  /** IndexedDB only. */
  storeName?: string;
};

/**
 * Shared `map:debug` bag (`getOrCreateStore`).
 * Dataset fields are filled by `@hungpvq/map-debug/dataset`.
 */
export type MapDebugStore = {
  /** Dataset Inspector + console API (`installDatasetDebug`). */
  dataset?: unknown;
  /**
   * Config for Devtools Logs. Applied before the first
   * {@link MapDebugStore.logDataStore} create; ignored after.
   */
  logStoreOptions?: MapDebugLogStoreOptions;
  /** Live LogDataStore for Devtools Logs (created once). */
  logDataStore?: LogDataStore;
  /** Adapter wired to {@link MapDebugStore.logDataStore}. */
  logAdapter?: DataStoreLogAdapter;
  /** Unsubscribe from logDataStore → Devtools UI mirror. */
  logStoreUnsub?: () => void;
};

/** Canonical pin for map debug state (`map:debug`). */
export function getMapDebugStore(): MapDebugStore {
  return getOrCreateStore<MapDebugStore>(MAP_DEBUG_STORE_KEY, () => ({}));
}
