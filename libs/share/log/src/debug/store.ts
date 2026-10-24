import { getOrCreateStore } from '@hungpvq/shared-store';

import {
  DataStoreLogAdapter,
  IndexedDBLogDataStore,
  type LogDataStore,
  loggerFactory,
  type LogRecord,
  MemoryLogDataStore,
  resolveMaybePromise,
} from '../core';

export const LOG_DEBUG_STORE_KEY = 'log:debug';

export type DebugErrorRecord = {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  stack?: string;
  recoverable: boolean;
  timestamp: number;
};

export type DebugLogStoreKind = 'memory' | 'indexeddb';

export type DebugLogStoreOptions = {
  kind?: DebugLogStoreKind;
  limit?: number;
  store?: LogDataStore;
  dbName?: string;
  storeName?: string;
};

export type DebugLogStoreConfig =
  | DebugLogStoreKind
  | LogDataStore
  | DebugLogStoreOptions;

export type DebugInstallOptions = {
  logStore?: DebugLogStoreConfig;
};

export type LogDebugStore = {
  logStoreOptions?: DebugLogStoreOptions;
  logDataStore?: LogDataStore;
  logAdapter?: DataStoreLogAdapter;
  logStoreUnsub?: () => void;
  errors: DebugErrorRecord[];
  logs: LogRecord[];
  installed: boolean;
  __cleanup__: Array<() => void>;
};

const dataListeners = new Set<() => void>();

export function subscribeDebugData(listener: () => void): () => void {
  dataListeners.add(listener);
  return () => {
    dataListeners.delete(listener);
  };
}

function notifyData() {
  for (const listener of dataListeners) listener();
}

export function getLogDebugStore(): LogDebugStore {
  return getOrCreateStore<LogDebugStore>(LOG_DEBUG_STORE_KEY, () => ({
    installed: false,
    errors: [],
    logs: [],
    __cleanup__: [],
  }));
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
  config: DebugLogStoreConfig,
): DebugLogStoreOptions {
  if (typeof config === 'string') return { kind: config };
  if (isLogDataStore(config)) return { store: config };
  return config;
}

function createDebugLogStore(options: DebugLogStoreOptions): LogDataStore {
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

let logsMirrorScheduled = false;

function scheduleLogsMirror() {
  if (logsMirrorScheduled) return;
  logsMirrorScheduled = true;
  queueMicrotask(() => {
    logsMirrorScheduled = false;
    const store = getLogDebugStore().logDataStore;
    if (!store) return;
    void resolveMaybePromise(store.getAll()).then((logs) => {
      getLogDebugStore().logs = [...logs];
      notifyData();
    });
  });
}

export function configureDebugLogStore(
  config: DebugLogStoreConfig = {},
): void {
  const bag = getLogDebugStore();
  if (bag.logDataStore) return;
  bag.logStoreOptions = {
    kind: 'indexeddb',
    ...bag.logStoreOptions,
    ...normalizeStoreConfig(config),
  };
}

export function getDebugLogDataStore(): LogDataStore {
  const bag = getLogDebugStore();
  if (!bag.logDataStore) {
    const options: DebugLogStoreOptions = {
      kind: 'indexeddb',
      ...bag.logStoreOptions,
    };
    bag.logStoreOptions = options;
    bag.logDataStore = createDebugLogStore(options);
    bag.logStoreUnsub = bag.logDataStore.subscribe(() => {
      scheduleLogsMirror();
    });
    scheduleLogsMirror();
  }
  return bag.logDataStore;
}

export function createDebugLogAdapter(): DataStoreLogAdapter {
  const bag = getLogDebugStore();
  if (bag.logAdapter) return bag.logAdapter;
  const store = getDebugLogDataStore();
  loggerFactory.setDataStore(store);
  bag.logAdapter = new DataStoreLogAdapter(store);
  return bag.logAdapter;
}

export function getDebugLogs(): LogRecord[] {
  return getLogDebugStore().logs;
}

export function getDebugErrors(): DebugErrorRecord[] {
  return getLogDebugStore().errors;
}

export function clearDebugLogs(): void {
  void resolveMaybePromise(getDebugLogDataStore().clear());
}

export async function refreshDebugLogsFromStore(): Promise<void> {
  const store = getDebugLogDataStore();
  const logs = await resolveMaybePromise(store.getAll());
  getLogDebugStore().logs = [...logs];
  notifyData();
}

export function replaceDebugLogs(logs: LogRecord[]): void {
  const store = getDebugLogDataStore();
  void (async () => {
    await resolveMaybePromise(store.clear());
    for (const r of [...logs].reverse()) {
      await resolveMaybePromise(store.append(r));
    }
  })();
}

export function addDebugCleanup(cleanup: () => void): void {
  const bag = getLogDebugStore();
  if (!bag.__cleanup__) bag.__cleanup__ = [];
  bag.__cleanup__.push(cleanup);
}

export function runDebugCleanup(): void {
  const bag = getLogDebugStore();
  bag.__cleanup__?.forEach((cleanup) => {
    cleanup();
  });
  bag.__cleanup__ = [];
}

export function notifyDebugData(): void {
  notifyData();
}
