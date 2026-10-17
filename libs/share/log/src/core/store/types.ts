import type { LogLevel, LogRecord } from '../types';

export type MaybePromise<T> = T | Promise<T>;

/** Normalize sync or async store results (memory vs IndexedDB). */
export function resolveMaybePromise<T>(value: MaybePromise<T>): Promise<T> {
  return Promise.resolve(value);
}

export type LogLevelFilter = 'all' | LogLevel;

/** Query options for {@link LogDataStore.list} / {@link list}. */
export type LogFilterQuery = {
  search?: string;
  level?: LogLevelFilter;
  /** Root namespace, or `'all'`. */
  namespace?: string;
  /** Map id, or `'all'`. */
  mapId?: string;
  actionId?: string;
};

/**
 * Queryable persistence for {@link LogRecord}s.
 * Distinct from {@link import('../types').LogAdapter} (output sinks).
 *
 * Treat {@link getAll} / {@link list} as async-capable
 * (`await resolveMaybePromise(store.list(query))`) so IndexedDB works.
 *
 * Built-in `kind` values: `'noop'` | `'memory'` | `'indexeddb'`.
 * Custom stores may use any other string tag.
 */
export interface LogDataStore {
  readonly kind: string;

  append(record: LogRecord): MaybePromise<void>;
  clear(): MaybePromise<void>;
  getAll(): MaybePromise<LogRecord[]>;
  /** Return records matching {@link LogFilterQuery}. */
  list(query?: LogFilterQuery): MaybePromise<LogRecord[]>;
  /** Notify listeners after mutations (memory / indexeddb). */
  subscribe(listener: () => void): () => void;
}
