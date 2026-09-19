import type { LogAdapter, LogHeader, LogRecord } from '@hungpvq/shared-log';

/**
 * Buffered log entry — same shape as {@link LogRecord} plus a stable UI `id`.
 */
export type BufferingLogEntry = {
  id: string;
  header: LogHeader;
  args: unknown[];
};

export type BufferingLogStore = {
  getLogs: () => BufferingLogEntry[];
  setLogs: (logs: BufferingLogEntry[]) => void;
};

/**
 * LogAdapter that buffers entries and flushes into an external store on rAF.
 * Used by map-devtools (Vue/React) with framework-specific state.
 */
export class BufferingLogAdapter implements LogAdapter {
  readonly alwaysOn = true;

  private buffer: BufferingLogEntry[] = [];
  private flushPending = false;

  constructor(
    private readonly store: BufferingLogStore,
    private readonly limit = 1000,
  ) {}

  log(record: LogRecord): void {
    this.buffer.unshift({
      id: Math.random().toString(36).slice(2, 11),
      header: { ...record.header },
      args: record.args,
    });

    if (!this.flushPending) {
      this.flushPending = true;
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => this.flush());
      } else {
        queueMicrotask(() => this.flush());
      }
    }
  }

  private flush() {
    if (this.buffer.length === 0) {
      this.flushPending = false;
      return;
    }

    const newLogs = [...this.buffer, ...this.store.getLogs()];
    if (newLogs.length > this.limit) {
      newLogs.splice(this.limit);
    }
    this.store.setLogs(newLogs);
    this.buffer = [];
    this.flushPending = false;
  }

  clear() {
    this.store.setLogs([]);
    this.buffer = [];
  }
}
