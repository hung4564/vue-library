import {
  DataStoreLogAdapter,
  IndexedDBLogDataStore,
  type LogDataStore,
  loggerFactory,
  type LogRecord,
  MemoryLogDataStore,
  resolveMaybePromise,
} from '@hungpvq/shared-log';

import {
  debounce,
  errorHandler,
  getMapCoreMetaStoreEvent,
} from '@hungpvq/map-core';
import {
  getMapDebugStore,
  type MapDebugLogStoreOptions,
} from './map-debug-store';

export type DevtoolTab = 'store' | 'logs' | 'errors' | 'dataset';

export interface DevtoolErrorRecord {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
  recoverable: boolean;
  timestamp: number;
}

export type DevtoolState = {
  isOpen: boolean;
  installedDataset?: boolean;
  activeTab: DevtoolTab;
  errors: DevtoolErrorRecord[];
  logs: LogRecord[];
};

/** Built-in store backends for Devtools Logs. Default: `'indexeddb'`. */
export type DevtoolLogStoreKind = NonNullable<MapDebugLogStoreOptions['kind']>;

/** @see {@link MapDebugLogStoreOptions} — stored on `getMapDebugStore().logStoreOptions`. */
export type DevtoolLogStoreOptions = MapDebugLogStoreOptions;

/**
 * `installDevtools({ logStore })` / {@link configureDevtoolLogStore} input:
 * built-in kind, options bag, or any custom {@link LogDataStore} instance.
 */
export type DevtoolLogStoreConfig =
  DevtoolLogStoreKind | LogDataStore | DevtoolLogStoreOptions;

export type DevtoolsInstallOptions = {
  /**
   * Log store for Devtools Logs.
   * Default: `'indexeddb'` (uncapped).
   * Pass `'memory'`, `{ kind: 'memory', limit }`, a custom {@link import('@hungpvq/shared-log').LogDataStore},
   * or call `configureDevtoolLogStore` first.
   */
  logStore?: DevtoolLogStoreConfig;
};

const notify = debounce(() => {
  getMapCoreMetaStoreEvent().emit('debug:update');
}, 100);

function patchState(patch: Partial<DevtoolState>) {
  getMapDebugStore().state = { ...getMapDebugStore().state, ...patch };
  notify();
}

/** Coalesce mirror updates so log writes during React render do not setState mid-tree. */
let logsMirrorScheduled = false;

function scheduleLogsMirror() {
  if (logsMirrorScheduled) return;
  logsMirrorScheduled = true;
  queueMicrotask(() => {
    logsMirrorScheduled = false;
    const store = getMapDebugStore().logDataStore;
    if (!store) return;
    void resolveMaybePromise(store.getAll()).then((logs) => {
      patchState({ logs: [...logs] });
    });
  });
}

function isLogDataStore(value: unknown): value is LogDataStore {
  if (!value || typeof value !== 'object') return false;
  const s = value as LogDataStore;
  return (
    typeof s.append === 'function' &&
    typeof s.clear === 'function' &&
    typeof s.getAll === 'function' &&
    typeof s.list === 'function' &&
    typeof s.subscribe === 'function'
  );
}

function normalizeStoreConfig(
  config: DevtoolLogStoreConfig,
): DevtoolLogStoreOptions {
  if (typeof config === 'string') return { kind: config };
  if (isLogDataStore(config)) return { store: config };
  return config;
}

function createDevtoolLogStore(options: DevtoolLogStoreOptions): LogDataStore {
  if (options.store) return options.store;
  if (options.kind === 'memory') {
    return new MemoryLogDataStore({
      limit: options.limit ?? 10_000,
    });
  }
  return new IndexedDBLogDataStore({
    dbName: options.dbName,
    storeName: options.storeName,
  });
}

/**
 * Choose the Devtools log store backend. Must run before the store is created.
 * Writes to {@link getMapDebugStore}.`logStoreOptions`.
 * Default when unset: IndexedDB (`IndexedDBLogDataStore`, uncapped).
 *
 * @example
 * configureDevtoolLogStore('memory')
 * configureDevtoolLogStore({ kind: 'memory', limit: 5_000 })
 * configureDevtoolLogStore(myCustomStore)
 */
export function configureDevtoolLogStore(
  config: DevtoolLogStoreConfig = {},
): void {
  const bag = getMapDebugStore();
  if (bag.logDataStore) return;
  bag.logStoreOptions = {
    kind: 'memory',
    ...bag.logStoreOptions,
    ...normalizeStoreConfig(config),
  };
}

export function getDevtoolLogDataStore(): LogDataStore {
  const bag = getMapDebugStore();
  if (!bag.logDataStore) {
    const options: DevtoolLogStoreOptions = {
      kind: 'memory',
      ...bag.logStoreOptions,
    };
    bag.logStoreOptions = options;
    bag.logDataStore = createDevtoolLogStore(options);
    bag.logStoreUnsub = bag.logDataStore.subscribe(() => {
      scheduleLogsMirror();
    });
    scheduleLogsMirror();
  }
  return bag.logDataStore;
}

export function subscribeDevtoolState(listener: () => void) {
  const events = getMapCoreMetaStoreEvent();
  events.on('debug:update', listener);
  return () => {
    events.off('debug:update', listener);
  };
}

export function getDevtoolState(): DevtoolState {
  return getMapDebugStore().state;
}

export function toggleDevtoolOpen() {
  patchState({ isOpen: !getDevtoolState().isOpen });
}

export function setDevtoolOpen(open: boolean) {
  if (getDevtoolState().isOpen === open) return;
  patchState({ isOpen: open });
}

export function setDevtoolActiveTab(activeTab: DevtoolTab) {
  patchState({ activeTab });
}

/** Open the Devtools panel on the Errors tab. */
export function openMapDevtoolsErrors() {
  patchState({ isOpen: true, activeTab: 'errors' });
}

export function clearDevtoolLogs() {
  void resolveMaybePromise(getDevtoolLogDataStore().clear());
}

/** Re-read the log store into Devtools UI state (Logs tab / badge count). */
export async function refreshDevtoolLogsFromStore(): Promise<void> {
  const store = getDevtoolLogDataStore();
  const logs = await resolveMaybePromise(store.getAll());
  patchState({ logs: [...logs] });
}

export function clearDevtoolErrors() {
  patchState({ errors: [] });
}

export function replaceDevtoolLogs(logs: LogRecord[]) {
  const store = getDevtoolLogDataStore();
  void (async () => {
    await resolveMaybePromise(store.clear());
    // append unshifts (newest first) — feed oldest → newest
    for (const r of [...logs].reverse()) {
      await resolveMaybePromise(store.append(r));
    }
  })();
}

export function replaceDevtoolErrors(errors: DevtoolErrorRecord[]) {
  patchState({ errors });
}

export function installDevtoolErrorListener() {
  return errorHandler.onError((error) => {
    patchState({
      errors: [
        {
          code: error.code,
          message: error.message,
          context: error.context,
          stack: error.stack,
          recoverable: error.recoverable,
          timestamp: Date.now(),
        },
        ...getDevtoolState().errors,
      ].slice(0, 50),
    });
  });
}

/** Idempotent: same adapter instance after first call (on {@link getMapDebugStore}). */
export function createDevtoolLogAdapter() {
  const bag = getMapDebugStore();
  if (bag.logAdapter) return bag.logAdapter;
  const store = getDevtoolLogDataStore();
  loggerFactory.setDataStore(store);
  bag.logAdapter = new DataStoreLogAdapter(store);
  return bag.logAdapter;
}

export function clearFunctionLog() {
  getMapDebugStore().__cleanup__?.forEach((cleanup) => {
    cleanup();
  });
  getMapDebugStore().__cleanup__ = [];
}

export function addClearFunctionLog(cleanup: () => void) {
  if (!getMapDebugStore().__cleanup__) {
    getMapDebugStore().__cleanup__ = [];
  }
  getMapDebugStore().__cleanup__.push(cleanup);
}
