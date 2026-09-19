import type { LogRecord } from '../types';
import { matchLogRecords } from './query';
import type { LogDataStore, LogFilterQuery, MaybePromise } from './types';

function isPromiseLike<T>(value: MaybePromise<T>): boolean {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as PromiseLike<T>).then === 'function'
  );
}

/** Shared subscribe + default query implementations over {@link getAll}. */
export abstract class BaseLogDataStore implements LogDataStore {
  abstract readonly kind: LogDataStore['kind'];

  private listeners = new Set<() => void>();

  abstract append(record: LogRecord): MaybePromise<void>;
  abstract clear(): MaybePromise<void>;
  abstract getAll(): MaybePromise<LogRecord[]>;

  /**
   * Filter via {@link matchLogRecords} after {@link getAll}.
   * Sync stores (memory/noop) may override with a sync return; IndexedDB keeps async.
   */
  list(query?: LogFilterQuery): MaybePromise<LogRecord[]> {
    const all = this.getAll();
    if (isPromiseLike(all)) {
      return Promise.resolve(all as PromiseLike<LogRecord[]>).then((rows) =>
        matchLogRecords(rows, query),
      );
    }
    return matchLogRecords(all as LogRecord[], query);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  protected notify(): void {
    for (const listener of this.listeners) listener();
  }
}
