import { LogAdapter, LogLevel } from '../types';

export class ConsoleAdapter implements LogAdapter {
  log(namespaces: string[], level: LogLevel, ...args: any[]) {
    const prefix_namespace = namespaces.map((ns) => `[${ns}]`).join('');
    const levelStr = ['groupEnd', 'groupCollapsed'].includes(level)
      ? ''
      : `[${level.toUpperCase()}]`;
    const prefix = `${levelStr}${prefix_namespace}`;
    console[level](prefix, ...args);
  }
}
