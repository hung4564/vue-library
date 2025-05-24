import { LogAdapter, LogLevel } from '../types';

export class ConsoleAdapter implements LogAdapter {
  log(namespaces: string[], level: LogLevel, ...args: any[]) {
    const prefix_namespace = namespaces.map((ns) => `[${ns}]`).join('');
    const prefix = `[${level.toUpperCase()}]${prefix_namespace}`;
    console[level](prefix, ...args);
  }
}
