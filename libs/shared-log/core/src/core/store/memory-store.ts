import type { DebugRecord, LogData } from '../types';
import { BaseLogDataStore } from './base-store';
import { matchLogRecords } from './query';
import type { LogFilterQuery } from './types';

export type MemoryLogDataStoreOptions = {
  /** Max retained records (newest first). Default `10000`. */
  limit?: number;
};

/**
 * Public sync API of {@link MemoryLogDataStore}.
 * Prefer this for Vue/React props and refs — class private fields
 * (`records`, `limit`, `listeners`, `notify`) break structural assignability.
 */
export interface MemoryLogDataStoreApi {
  readonly kind: 'memory';
  append(record: DebugRecord<LogData>): void;
  clear(): void;
  getAll(): DebugRecord<LogData>[];
  list(query?: LogFilterQuery): DebugRecord<LogData>[];
  subscribe(listener: () => void): () => void;
}

/**
 * In-memory ring buffer (newest first), default cap 10_000.
 * Sync get/list API for Devtools UI.
 */
export class MemoryLogDataStore
  extends BaseLogDataStore
  implements MemoryLogDataStoreApi
{
  readonly kind = 'memory' as const;

  private records: DebugRecord<LogData>[] = [];
  private readonly limit: number;

  constructor(options: MemoryLogDataStoreOptions = {}) {
    super();
    this.limit = Math.max(1, options.limit ?? 10_000);
  }

  append(record: DebugRecord<LogData>): void {
    this.records.unshift(record);
    if (this.records.length > this.limit) {
      this.records.length = this.limit;
    }
    this.notify();
  }

  clear(): void {
    if (this.records.length === 0) return;
    this.records = [];
    this.notify();
  }

  getAll(): DebugRecord<LogData>[] {
    return this.records;
  }

  override list(query?: LogFilterQuery): DebugRecord<LogData>[] {
    return matchLogRecords(this.records, query);
  }
}
