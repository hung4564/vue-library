import { LogAdapter, LogLevel } from '@hungpvq/shared-log';
import { shallowRef } from 'vue';

export interface LogEntry {
  id: string;
  timestamp: number;
  namespaces: string[];
  level: LogLevel;
  args: any[];
}

export class DevtoolLogAdapter implements LogAdapter {
  // Use shallowRef for better performance with large arrays
  public logs = shallowRef<LogEntry[]>([]);
  private buffer: LogEntry[] = [];
  private limit = 1000;
  private flushPending = false;

  constructor(limit = 1000) {
    this.limit = limit;
  }

  log(namespaces: string[], level: LogLevel, ...args: any[]): void {
    const entry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      namespaces,
      level,
      args, // Be careful with args, they might be reactive objects
    };

    this.buffer.unshift(entry);

    if (!this.flushPending) {
      this.flushPending = true;
      // Flush on next frame to avoid synchronous recursive updates
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

    // Append buffer to logs
    const newLogs = [...this.buffer, ...this.logs.value];

    // Trim if needed
    if (newLogs.length > this.limit) {
      newLogs.splice(0, this.limit);
    }

    this.logs.value = newLogs;
    this.buffer = [];
    this.flushPending = false;
  }

  clear() {
    this.logs.value = [];
    this.buffer = [];
  }
}
