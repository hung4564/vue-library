import type { DebugRecord, LogData } from '../types';
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

  abstract append(record: DebugRecord<LogData>): MaybePromise<void>;
  abstract clear(): MaybePromise<void>;
  abstract getAll(): MaybePromise<DebugRecord<LogData>[]>;

  /**
   * Filter via {@link matchLogRecords} after {@link getAll}.
   * Sync stores (memory/noop) may override with a sync return; IndexedDB keeps async.
   */
  list(query?: LogFilterQuery): MaybePromise<DebugRecord<LogData>[]> {
    const all = this.getAll();
    if (isPromiseLike(all)) {
      return Promise.resolve(all as PromiseLike<DebugRecord<LogData>[]>).then(
        (rows) => matchLogRecords(rows, query),
      );
    }
    return matchLogRecords(all as DebugRecord<LogData>[], query);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  protected notify(): void {
    for (const listener of this.listeners) listener();
  }
}
