import { getOrCreateStore } from '@hungpvq/shared-store';

import {
  DataStoreLogAdapter,
  type DebugRecord,
  type Framework,
  IndexedDBLogDataStore,
  type LiveData,
  type LogData,
  type LogDataStore,
  loggerFactory,
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
  DebugLogStoreKind | LogDataStore | DebugLogStoreOptions;

export type DebugInstallOptions = {
  logStore?: DebugLogStoreConfig;
  /** When true (default), clear logs + live traces on path/hash change. */
  clearOnNavigate?: boolean;
};

export type LiveInstanceRecord = {
  id: string;
  framework: Framework;
  component: string;
  parentId?: string;
};

export type LogDebugStore = {
  logStoreOptions?: DebugLogStoreOptions;
  logDataStore?: LogDataStore;
  logAdapter?: DataStoreLogAdapter;
  logStoreUnsub?: () => void;
  errors: DebugErrorRecord[];
  logs: DebugRecord<LogData>[];
  installed: boolean;
  __cleanup__: Array<() => void>;
  dataListeners: Set<() => void>;
  logsMirrorScheduled: boolean;
  liveEvents: DebugRecord<LiveData>[];
  liveListeners: Set<() => void>;
  instances: Map<string, LiveInstanceRecord>;
  instanceListeners: Set<() => void>;
  instanceSnapshot: LiveInstanceRecord[];
  nextVueId: number;
  nextReactId: number;
  clearOnNavigate: boolean;
  navKey?: string;
};

export function subscribeDebugData(listener: () => void): () => void {
  const bag = getLogDebugStore();
  bag.dataListeners.add(listener);
  return () => {
    bag.dataListeners.delete(listener);
  };
}

function notifyData() {
  for (const listener of getLogDebugStore().dataListeners) listener();
}

export function getLogDebugStore(): LogDebugStore {
  const bag = getOrCreateStore<LogDebugStore>(LOG_DEBUG_STORE_KEY, () => ({
    installed: false,
    errors: [],
    logs: [],
    __cleanup__: [],
    dataListeners: new Set(),
    logsMirrorScheduled: false,
    liveEvents: [],
    liveListeners: new Set(),
    instances: new Map(),
    instanceListeners: new Set(),
    instanceSnapshot: [],
    nextVueId: 0,
    nextReactId: 0,
    clearOnNavigate: true,
  }));
  if (!bag.dataListeners) bag.dataListeners = new Set();
  if (bag.logsMirrorScheduled === undefined) bag.logsMirrorScheduled = false;
  if (!bag.liveEvents) bag.liveEvents = [];
  if (!bag.liveListeners) bag.liveListeners = new Set();
  if (!bag.instances) bag.instances = new Map();
  if (!bag.instanceListeners) bag.instanceListeners = new Set();
  if (!bag.instanceSnapshot) bag.instanceSnapshot = [];
  if (bag.nextVueId === undefined) bag.nextVueId = 0;
  if (bag.nextReactId === undefined) bag.nextReactId = 0;
  if (bag.clearOnNavigate === undefined) bag.clearOnNavigate = true;
  return bag;
}

export function isClearLogsOnNavigate(): boolean {
  return getLogDebugStore().clearOnNavigate !== false;
}

export function setClearLogsOnNavigate(enabled: boolean): void {
  const bag = getLogDebugStore();
  if (bag.clearOnNavigate === enabled) return;
  bag.clearOnNavigate = enabled;
  notifyData();
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

function scheduleLogsMirror() {
  const bag = getLogDebugStore();
  if (bag.logsMirrorScheduled) return;
  bag.logsMirrorScheduled = true;
  queueMicrotask(() => {
    bag.logsMirrorScheduled = false;
    const store = getLogDebugStore().logDataStore;
    if (!store) return;
    void resolveMaybePromise(store.getAll()).then((rows) => {
      const current = getLogDebugStore();
      const byId = new Map(current.logs.map((row) => [row.id, row]));
      for (const row of rows) byId.set(row.id, row);
      current.logs = [...byId.values()].sort(
        (a, b) => b.header.ts - a.header.ts,
      );
      notifyData();
    });
  });
}

export function configureDebugLogStore(config: DebugLogStoreConfig = {}): void {
  const bag = getLogDebugStore();
  if (bag.logDataStore) return;
  bag.logStoreOptions = {
    kind: 'memory',
    ...bag.logStoreOptions,
    ...normalizeStoreConfig(config),
  };
}

export function getDebugLogDataStore(): LogDataStore {
  const bag = getLogDebugStore();
  if (!bag.logDataStore) {
    const options: DebugLogStoreOptions = {
      kind: 'memory',
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
  const adapter = new DataStoreLogAdapter(store);
  const write = adapter.log.bind(adapter);
  adapter.log = (record) => {
    const current = getLogDebugStore();
    if (!current.logs.some((row) => row.id === record.id)) {
      current.logs = [record, ...current.logs];
      notifyData();
    }
    write(record);
  };
  bag.logAdapter = adapter;
  return bag.logAdapter;
}

export function getDebugLogs(): DebugRecord<LogData>[] {
  return getLogDebugStore().logs;
}

export function getDebugErrors(): DebugErrorRecord[] {
  return getLogDebugStore().errors;
}

export function clearDebugLogs(): void {
  const bag = getLogDebugStore();
  bag.logs = [];
  notifyData();
  void resolveMaybePromise(getDebugLogDataStore().clear());
}

export async function refreshDebugLogsFromStore(): Promise<void> {
  const store = getDebugLogDataStore();
  const logs = await resolveMaybePromise(store.getAll());
  getLogDebugStore().logs = [...logs];
  notifyData();
}

export function replaceDebugLogs(logs: DebugRecord<LogData>[]): void {
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
