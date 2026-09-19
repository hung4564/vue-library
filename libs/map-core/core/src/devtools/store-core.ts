import {
  DataStoreLogAdapter,
  IndexedDBLogDataStore,
  loggerFactory,
  logMapId,
  MemoryLogDataStore,
  resolveMaybePromise,
  type LogDataStore,
  type LogRecord,
} from '@hungpvq/shared-log';
import { errorHandler } from '../services/error-handler.service';
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
  activeTab: DevtoolTab;
  /** Global map filter for all viewers (`'all'` = no filter). */
  filterMapId: string;
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

let state: DevtoolState = {
  isOpen: false,
  activeTab: 'store',
  filterMapId: 'all',
  errors: [],
  logs: [],
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function patchState(patch: Partial<DevtoolState>) {
  state = { ...state, ...patch };
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
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getDevtoolState(): DevtoolState {
  return state;
}

export function toggleDevtoolOpen() {
  patchState({ isOpen: !state.isOpen });
}

export function setDevtoolOpen(open: boolean) {
  if (state.isOpen === open) return;
  patchState({ isOpen: open });
}

export function setDevtoolActiveTab(activeTab: DevtoolTab) {
  patchState({ activeTab });
}

/** Global mapId filter shared by Store / Logs / Errors / Dataset viewers. */
export function setDevtoolFilterMapId(filterMapId: string) {
  if (state.filterMapId === filterMapId) return;
  patchState({ filterMapId });
}

/** Open the Devtools panel on the Errors tab. */
export function openMapDevtoolsErrors() {
  patchState({ isOpen: true, activeTab: 'errors' });
}

export const OPEN_DEVTOOLS_ERRORS_EVENT = 'hungpvq:map-open-devtools-errors';

let errorsShortcutInstalled = false;

export function installDevtoolsErrorsShortcut() {
  if (typeof window === 'undefined' || errorsShortcutInstalled) return;
  errorsShortcutInstalled = true;
  window.addEventListener(OPEN_DEVTOOLS_ERRORS_EVENT, () => {
    openMapDevtoolsErrors();
  });
}

export function clearDevtoolLogs() {
  void resolveMaybePromise(getDevtoolLogDataStore().clear());
}

/**
 * Drop Devtools log records for one mapId (no-op if the log store was never
 * created — does not spin up IndexedDB just to clear).
 */
export function clearDevtoolLogsForMapId(mapId: string): void {
  if (!mapId) return;
  const bag = getMapDebugStore();
  const store = bag.logDataStore;
  if (!store) return;
  void (async () => {
    const all = await resolveMaybePromise(store.getAll());
    const kept = all.filter((r) => logMapId(r) !== mapId);
    if (kept.length === all.length) return;
    await resolveMaybePromise(store.clear());
    for (const r of [...kept].reverse()) {
      await resolveMaybePromise(store.append(r));
    }
    patchState({ logs: [...kept] });
  })();
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

/** Drop in-memory Devtools error rows whose context.mapId matches. */
export function clearDevtoolErrorsForMapId(mapId: string): void {
  if (!mapId) return;
  const next = state.errors.filter((e) => e.context?.mapId !== mapId);
  if (next.length === state.errors.length) return;
  patchState({ errors: next });
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

let errorListenerInstalled = false;

export function installDevtoolErrorListener() {
  if (errorListenerInstalled) return;
  errorListenerInstalled = true;

  errorHandler.onError((error) => {
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
        ...state.errors,
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

/** Initialize shared devtools store side effects (idempotent). */
export function initDevtoolStoreCore() {
  installDevtoolsErrorsShortcut();
  installDevtoolErrorListener();
}
