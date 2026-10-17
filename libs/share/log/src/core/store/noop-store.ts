import type { LogRecord } from '../types';
import { BaseLogDataStore } from './base-store';
import type { LogFilterQuery } from './types';

/** Does not retain records — default companion for {@link ConsoleAdapter}. */
export class NoopLogDataStore extends BaseLogDataStore {
  readonly kind = 'noop' as const;

  append(_record: LogRecord): void {
    /* intentionally empty */
  }

  clear(): void {
    /* intentionally empty */
  }

  getAll(): LogRecord[] {
    return [];
  }

  override list(_query?: LogFilterQuery): LogRecord[] {
    return [];
  }
}

/** Shared singleton for ConsoleAdapter / factory default. */
export const noopLogDataStore = new NoopLogDataStore();
