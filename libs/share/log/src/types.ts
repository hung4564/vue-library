export type LogLevel =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'groupEnd'
  | 'groupCollapsed';

export interface LogAdapter {
  log(namespaces: string[], level: LogLevel, ...args: any[]): void;
  /** When true, receives logs even when logging is globally disabled */
  alwaysOn?: boolean;
}
