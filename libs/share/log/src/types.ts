export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogAdapter {
  log(namespaces: string[], level: LogLevel, ...args: any[]): void;
}
