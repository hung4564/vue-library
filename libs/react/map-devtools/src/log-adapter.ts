import { LogAdapter, LogLevel } from '@hungpvq/shared-log';

export interface LogEntry {
  id: string;
  timestamp: number;
  namespaces: string[];
  level: LogLevel;
  args: unknown[];
}

export class DevtoolLogAdapter implements LogAdapter {
  readonly alwaysOn = true;

  private buffer: LogEntry[] = [];
  private limit = 1000;
  private flushPending = false;

  constructor(limit = 1000) {
    this.limit = limit;
  }

  log(namespaces: string[], level: LogLevel, ...args: unknown[]): void {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      namespaces,
      level,
      args,
    };

    this.buffer.unshift(entry);

    if (!this.flushPending) {
      this.flushPending = true;
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush() {
    if (this.buffer.length === 0) {
      this.flushPending = false;
      return;
    }

    import('./store').then(({ devtoolState }) => {
      const newLogs = [...this.buffer, ...devtoolState.logs];

      if (newLogs.length > this.limit) {
        newLogs.splice(this.limit);
      }

      devtoolState.logs = newLogs;
      this.buffer = [];
      this.flushPending = false;
    });
  }

  clear() {
    import('./store').then(({ devtoolState }) => {
      devtoolState.logs = [];
      this.buffer = [];
    });
  }
}
