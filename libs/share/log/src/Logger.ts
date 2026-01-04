import { LogAdapter, LogLevel } from './types';

export class Logger {
  private namespaceMap: Map<number, string> = new Map();

  private namespaceMapHide: Map<string, boolean> = new Map();

  constructor(
    private adapters: LogAdapter[],
    private isEnabled: (namespaces: string[]) => boolean,
  ) {}

  setNamespace(ns: string, priority = 0, hide = false): this {
    this.namespaceMap.set(priority, ns);
    this.namespaceMapHide.set(ns, hide);
    return this;
  }

  removeNamespace(priority: number): this {
    this.namespaceMap.delete(priority);
    return this;
  }

  clearNamespaces(): this {
    this.namespaceMap.clear();
    return this;
  }

  getNamespace(priority: number): string | undefined {
    return this.namespaceMap.get(priority);
  }

  getNamespaces(): string[] {
    return this.getSortedNamespaces();
  }

  private getSortedNamespaces(): string[] {
    return [...this.namespaceMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, ns]) => ns);
  }

  private log(level: LogLevel, ...args: any[]) {
    const nsList = this.getSortedNamespaces();
    if (this.isEnabled(nsList)) {
      for (const adapter of this.adapters) {
        adapter.log(
          nsList.filter((x) => !this.namespaceMapHide.get(x)),
          level,
          ...args,
        );
      }
    }
  }

  debug(...args: any[]) {
    this.log('debug', ...args);
  }

  info(...args: any[]) {
    this.log('info', ...args);
  }

  warn(...args: any[]) {
    this.log('warn', ...args);
  }

  error(...args: any[]) {
    this.log('error', ...args);
  }

  groupEnd(...args: any[]) {
    this.log('groupEnd', ...args);
  }
  groupCollapsed(...args: any[]) {
    this.log('groupCollapsed', ...args);
  }
}
