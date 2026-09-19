import type { LogAdapter, LogRecord } from '../types';
import type { LogDataStore } from './types';

/**
 * {@link LogAdapter} that writes every record into a {@link LogDataStore}.
 * Use with {@link MemoryLogDataStore} or {@link IndexedDBLogDataStore}.
 */
export class DataStoreLogAdapter implements LogAdapter {
  readonly alwaysOn = true;

  constructor(private readonly store: LogDataStore) {}

  get dataStore(): LogDataStore {
    return this.store;
  }

  log(record: LogRecord): void {
    void this.store.append(record);
  }

  clear(): void {
    void this.store.clear();
  }
}
