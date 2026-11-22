import { migrateDebugRecord, needsRecordRewrite } from '../record';
import type { DebugRecord, LogData } from '../types';
import { BaseLogDataStore } from './base-store';
import { matchLogRecords } from './query';
import type { LogFilterQuery } from './types';

export type IndexedDBLogDataStoreOptions = {
  dbName?: string;
  storeName?: string;
};

const DEFAULT_DB = 'hungpvq-shared-log';
const DEFAULT_STORE = 'records';
/** v1: ts + actionId; v2: + namespace (multiEntry on `header.namespaces`). */
const DB_VERSION = 2;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sortNewestFirst(rows: DebugRecord<LogData>[]): DebugRecord<LogData>[] {
  return rows.slice().sort((a, b) => b.header.ts - a.header.ts);
}

/**
 * Persist logs in IndexedDB (browser). Methods are async.
 * Falls back to an in-memory buffer when IndexedDB is unavailable.
 * No retention cap — use {@link MemoryLogDataStore} when you need a limit.
 *
 * {@link list} prefers IDB indexes for `actionId` (exact) and `namespace`
 * (multiEntry on `header.namespaces`), then applies {@link matchLogRecords}
 * for residual filters (level / search / mapId / actionId substring).
 */
export class IndexedDBLogDataStore extends BaseLogDataStore {
  readonly kind = 'indexeddb' as const;

  private readonly dbName: string;
  private readonly storeName: string;
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryFallback: DebugRecord<LogData>[] = [];
  private migrated = false;
  private useMemory = typeof indexedDB === 'undefined';

  constructor(options: IndexedDBLogDataStoreOptions = {}) {
    super();
    this.dbName = options.dbName ?? DEFAULT_DB;
    this.storeName = options.storeName ?? DEFAULT_STORE;
  }

  private openDb(): Promise<IDBDatabase> {
    if (this.useMemory) {
      return Promise.reject(new Error('IndexedDB unavailable'));
    }
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(this.dbName, DB_VERSION);
        req.onupgradeneeded = (event) => {
          const db = req.result;
          const oldVersion = event.oldVersion;
          const tx = (event.target as IDBOpenDBRequest).transaction;
          if (!db.objectStoreNames.contains(this.storeName)) {
            const store = db.createObjectStore(this.storeName, {
              keyPath: 'id',
            });
            store.createIndex('ts', 'header.ts', { unique: false });
            store.createIndex('actionId', 'header.actionId', {
              unique: false,
            });
            store.createIndex('namespace', 'header.namespaces', {
              unique: false,
              multiEntry: true,
            });
          } else if (oldVersion < 2 && tx) {
            const store = tx.objectStore(this.storeName);
            if (!store.indexNames.contains('namespace')) {
              store.createIndex('namespace', 'header.namespaces', {
                unique: false,
                multiEntry: true,
              });
            }
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          this.useMemory = true;
          reject(req.error ?? new Error('IndexedDB open failed'));
        };
      });
    }
    return this.dbPromise;
  }

  private async withStore<T>(
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => Promise<T> | T,
  ): Promise<T> {
    try {
      const db = await this.openDb();
      return await new Promise<T>((resolve, reject) => {
        const tx = db.transaction(this.storeName, mode);
        const store = tx.objectStore(this.storeName);
        let result: T | undefined;
        let fnFailed = false;
        Promise.resolve(fn(store)).then(
          (value) => {
            result = value;
          },
          (err) => {
            fnFailed = true;
            reject(err);
          },
        );
        tx.oncomplete = () => {
          if (!fnFailed) resolve(result as T);
        };
        tx.onerror = () => reject(tx.error ?? new Error('IDB tx failed'));
        tx.onabort = () => reject(tx.error ?? new Error('IDB tx aborted'));
      });
    } catch {
      this.useMemory = true;
      throw new Error('IndexedDB unavailable');
    }
  }

  async append(record: DebugRecord<LogData>): Promise<void> {
    if (this.useMemory) {
      this.memoryFallback.unshift(record);
      this.notify();
      return;
    }
    try {
      await this.withStore('readwrite', (store) => {
        store.put(record);
      });
      this.notify();
    } catch {
      this.memoryFallback.unshift(record);
      this.notify();
    }
  }

  private normalizeRows(raw: unknown[]): DebugRecord<LogData>[] {
    return raw.map((row) =>
      needsRecordRewrite(row)
        ? migrateDebugRecord(row)
        : (row as DebugRecord<LogData>),
    );
  }

  private async rewriteStale(raw: unknown[]): Promise<void> {
    const stale = raw.filter((row) => needsRecordRewrite(row));
    if (stale.length === 0) return;
    await this.withStore('readwrite', (store) => {
      for (const row of stale) {
        store.put(migrateDebugRecord(row));
      }
    });
  }

  private getAllFromDb(): Promise<DebugRecord<LogData>[]> {
    return this.withStore('readonly', (store) => {
      return new Promise<DebugRecord<LogData>[]>((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => {
          const raw = req.result as unknown[];
          resolve(sortNewestFirst(this.normalizeRows(raw)));
        };
        req.onerror = () => reject(req.error);
      });
    });
  }

  private getByIndex(
    indexName: string,
    key: IDBValidKey,
  ): Promise<DebugRecord<LogData>[]> {
    return this.withStore('readonly', (store) => {
      return new Promise<DebugRecord<LogData>[]>((resolve, reject) => {
        if (!store.indexNames.contains(indexName)) {
          const req = store.getAll();
          req.onsuccess = () =>
            resolve(
              sortNewestFirst(this.normalizeRows(req.result as unknown[])),
            );
          req.onerror = () => reject(req.error);
          return;
        }
        const req = store.index(indexName).getAll(key);
        req.onsuccess = () =>
          resolve(sortNewestFirst(this.normalizeRows(req.result as unknown[])));
        req.onerror = () => reject(req.error);
      });
    });
  }

  /**
   * Narrow candidates via IDB indexes when possible; otherwise full scan.
   * Residual filters still go through {@link matchLogRecords}.
   */
  private async fetchCandidates(
    query?: LogFilterQuery,
  ): Promise<DebugRecord<LogData>[]> {
    const action = query?.actionId?.trim() ?? '';
    const ns =
      query?.namespace && query.namespace !== 'all' ? query.namespace : '';

    if (action) {
      const exact = await this.getByIndex('actionId', action);
      if (exact.length > 0 || UUID_RE.test(action)) {
        return exact;
      }
      // Substring / case-insensitive actionId: scope by namespace when set.
      if (ns) return this.getByIndex('namespace', ns);
      return this.getAllFromDb();
    }

    if (ns) return this.getByIndex('namespace', ns);
    return this.getAllFromDb();
  }

  async clear(): Promise<void> {
    if (this.useMemory) {
      this.memoryFallback = [];
      this.notify();
      return;
    }
    try {
      await this.withStore('readwrite', (store) => {
        store.clear();
      });
      this.notify();
    } catch {
      this.memoryFallback = [];
      this.notify();
    }
  }

  async getAll(): Promise<DebugRecord<LogData>[]> {
    if (this.useMemory) return this.memoryFallback;
    try {
      const db = await this.openDb();
      const raw = await new Promise<unknown[]>((resolve, reject) => {
        const tx = db.transaction(this.storeName, 'readonly');
        const req = tx.objectStore(this.storeName).getAll();
        req.onsuccess = () => resolve(req.result as unknown[]);
        req.onerror = () => reject(req.error);
      });
      if (!this.migrated) {
        this.migrated = true;
        void this.rewriteStale(raw);
      }
      return sortNewestFirst(this.normalizeRows(raw));
    } catch {
      return this.memoryFallback;
    }
  }

  /**
   * Prefer IDB `actionId` / `namespace` indexes, then {@link matchLogRecords}
   * for level / search / mapId / actionId substring.
   */
  override async list(query?: LogFilterQuery): Promise<DebugRecord<LogData>[]> {
    if (this.useMemory) {
      return matchLogRecords(this.memoryFallback, query);
    }
    try {
      const candidates = await this.fetchCandidates(query);
      return matchLogRecords(candidates, query);
    } catch {
      return matchLogRecords(this.memoryFallback, query);
    }
  }
}
