import type { LogAdapter, LogContext, LogLevel, LogRecord } from './types';
import { captureLogCallerSite } from './caller';
import { LoggerFactory } from './LoggerFactory';
import { getUUIDv4 } from './uuid';

type LoggerOptions = {
  bound?: LogContext;
  /** Extra namespaces appended after the base map (for logHelper views). */
  extraNamespaces?: string[];
};

/**
 * Bound logger view — does not mutate the parent namespace map.
 * Header merges ambient zone context with {@link Logger.with} bound fields.
 */
export class Logger {
  private namespaceMap: Map<number, string> = new Map();
  private namespaceMapHide: Map<string, boolean> = new Map();
  private readonly bound: LogContext;
  private readonly extraNamespaces: string[];

  constructor(
    private adapters: LogAdapter[],
    private isEnabled: (namespaces: string[]) => boolean,
    private getAmbientContext: () => LogContext | undefined,
    options: LoggerOptions = {},
  ) {
    this.bound = { ...(options.bound ?? {}) };
    this.extraNamespaces = [...(options.extraNamespaces ?? [])];
  }

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

  /**
   * Immutable view with extra context (and optional extra namespaces).
   * Does not mutate this logger's namespace map.
   */
  with(partial: LogContext, extraNamespaces?: string[]): Logger {
    const child = new Logger(
      this.adapters,
      this.isEnabled,
      this.getAmbientContext,
      {
        bound: { ...this.bound, ...partial },
        extraNamespaces: [
          ...this.extraNamespaces,
          ...(extraNamespaces ?? []),
        ],
      },
    );
    for (const [priority, ns] of this.namespaceMap) {
      child.namespaceMap.set(priority, ns);
      child.namespaceMapHide.set(
        ns,
        this.namespaceMapHide.get(ns) ?? false,
      );
    }
    return child;
  }

  /** Shorthand for `with({ fn })`. */
  at(fn: string): Logger {
    return this.with({ fn });
  }

  private getSortedNamespaces(): string[] {
    const base = [...this.namespaceMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([, ns]) => ns);
    return [...base, ...this.extraNamespaces];
  }

  private buildRecord(level: LogLevel, args: unknown[]): LogRecord {
    const nsList = this.getSortedNamespaces();
    const filteredNs = nsList.filter((x) => !this.namespaceMapHide.get(x));
    const ambient = this.getAmbientContext() ?? {};
    const index = LoggerFactory.getInstance().nextMethodIndex();
    const header: LogRecord['header'] = {
      ts: Date.now(),
      level,
      namespaces: filteredNs,
      ...ambient,
      ...this.bound,
      // Always last — bound/ambient must not overwrite hierarchical index.
      index,
    };
    if (!header.actionId) {
      header.actionId = getUUIDv4();
    }
    if (!header.fn) {
      const site = captureLogCallerSite();
      if (site.fn) header.fn = site.fn;
    }
    return { id: getUUIDv4(), header, args };
  }

  private log(level: LogLevel, ...args: unknown[]) {
    const nsList = this.getSortedNamespaces();
    const enabled = this.isEnabled(nsList);
    const record = this.buildRecord(level, args);

    for (const adapter of this.adapters) {
      if (enabled || adapter.alwaysOn) {
        adapter.log(record);
      }
    }
  }

  debug(...args: unknown[]) {
    this.log('debug', ...args);
  }

  info(...args: unknown[]) {
    this.log('info', ...args);
  }

  warn(...args: unknown[]) {
    this.log('warn', ...args);
  }

  error(...args: unknown[]) {
    this.log('error', ...args);
  }
}
