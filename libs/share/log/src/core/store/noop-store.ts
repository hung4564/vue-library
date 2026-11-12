import type { DebugRecord, LogData } from '../types';
import { BaseLogDataStore } from './base-store';
import type { LogFilterQuery } from './types';

/** Does not retain records — default companion for {@link ConsoleAdapter}. */
export class NoopLogDataStore extends BaseLogDataStore {
  readonly kind = 'noop' as const;

  append(_record: DebugRecord<LogData>): void {
    /* intentionally empty */
  }

  clear(): void {
    /* intentionally empty */
  }

  getAll(): DebugRecord<LogData>[] {
    return [];
  }

  override list(_query?: LogFilterQuery): DebugRecord<LogData>[] {
    return [];
  }
}

/** Shared singleton for ConsoleAdapter / factory default. */
export const noopLogDataStore = new NoopLogDataStore();
