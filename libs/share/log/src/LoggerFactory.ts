import { ConsoleAdapter } from './adapters/ConsoleAdapter';
import {
  bumpMethodIndex,
  compactLogContext,
  type LogZoneState,
} from './log-zone-state';
import { Logger } from './Logger';
import { noopLogDataStore } from './store/noop-store';
import type { LogDataStore } from './store/types';
import type { LogAdapter, LogContext } from './types';
import { getUUIDv4 } from './uuid';
import {
  getLogZoneStorage,
  resetZoneContextStorageForTests,
} from './zone-context-storage';

function isPromiseLike<T>(value: T | PromiseLike<T>): value is PromiseLike<T> {
  return (
    value != null &&
    typeof value === 'object' &&
    typeof (value as PromiseLike<T>).then === 'function'
  );
}

/** Strip query/hash that may hold tokens; keep origin + pathname. */
export function sanitizeHttpUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    if (typeof URL !== 'undefined' && /^https?:\/\//i.test(url)) {
      const u = new URL(url);
      return `${u.origin}${u.pathname}`;
    }
  } catch {
    /* fall through */
  }
  const q = url.indexOf('?');
  const h = url.indexOf('#');
  const cut = q >= 0 && h >= 0 ? Math.min(q, h) : q >= 0 ? q : h >= 0 ? h : -1;
  return cut >= 0 ? url.slice(0, cut) : url;
}

export type TrackRequestMeta = {
  span?: string;
  url?: string;
  method?: string;
  mapId?: string;
  fn?: string;
  /** Optional HTTP status when known after settle (caller may set via return). */
  status?: number;
};

export class LoggerFactory {
  private adapters: LogAdapter[] = [new ConsoleAdapter()];
  /** Queryable store; default noop (ConsoleAdapter companion). */
  private dataStore: LogDataStore = noopLogDataStore;

  private enableAll = true;
  private disabledNamespaces: Set<string> = new Set();
  private enabledNamespaces: Set<string> = new Set();

  static getInstance(): LoggerFactory {
    const host = globalThis as typeof globalThis & {
      __hungpvq_LoggerFactory__?: LoggerFactory;
    };
    if (!host.__hungpvq_LoggerFactory__) {
      host.__hungpvq_LoggerFactory__ = new LoggerFactory();
    }
    return host.__hungpvq_LoggerFactory__;
  }

  /** Reset singleton + zone storage (tests). */
  static resetInstanceForTests(): void {
    const host = globalThis as typeof globalThis & {
      __hungpvq_LoggerFactory__?: LoggerFactory;
    };
    delete host.__hungpvq_LoggerFactory__;
    resetZoneContextStorageForTests();
  }

  enableEverything() {
    this.enableAll = true;
    this.disabledNamespaces.clear();
    this.enabledNamespaces.clear();
  }

  disableEverything() {
    this.enableAll = false;
    this.disabledNamespaces.clear();
    this.enabledNamespaces.clear();
  }

  disable(namespace: string) {
    if (this.enableAll) {
      this.disabledNamespaces.add(namespace);
    }
  }

  enable(namespace: string) {
    if (!this.enableAll) {
      this.enabledNamespaces.add(namespace);
    }
  }

  isEnabled(namespaces: string[]): boolean {
    if (this.enableAll) {
      return !namespaces.some((ns) => this.disabledNamespaces.has(ns));
    }
    return namespaces.some((ns) => this.enabledNamespaces.has(ns));
  }

  addAdapter(adapter: LogAdapter) {
    this.adapters.push(adapter);
  }

  clearAdapters() {
    this.adapters.length = 0;
  }

  getAdapters(): LogAdapter[] {
    return this.adapters;
  }

  /** Active {@link LogDataStore} used for get/filter/query (default noop). */
  getDataStore(): LogDataStore {
    return this.dataStore;
  }

  setDataStore(store: LogDataStore): this {
    this.dataStore = store;
    return this;
  }

  /** Ambient log fields for the current async zone (not sticky local). */
  getContext(): LogContext | undefined {
    return this.getZoneState()?.context;
  }

  /** Full zone state including hierarchical index path. */
  getZoneState(): LogZoneState | undefined {
    return getLogZoneStorage<LogZoneState>().getStore();
  }

  /**
   * Next hierarchical method index (`1`, `2.1`, …). Mutates zone `indexPath`.
   * Outside a zone, returns `"1"` without process-wide sequencing.
   */
  nextMethodIndex(): string {
    const state = this.getZoneState();
    if (!state) return '1';
    return bumpMethodIndex(state);
  }

  runWithZoneState<T>(
    state: LogZoneState,
    fn: () => T | Promise<T>,
  ): T | Promise<T> {
    const storage = getLogZoneStorage<LogZoneState>();
    return storage.run(state, () => {
      const result = fn();
      if (!isPromiseLike(result)) return result;
      // Re-enter the same zone when the promise settles so callers chaining
      // on this return keep actionId under browser sticky zone restore.
      return Promise.resolve(result).then(
        (value) => storage.run(state, () => value as T),
        (err) =>
          storage.run(state, () => {
            throw err;
          }),
      ) as Promise<T>;
    });
  }

  /**
   * Run `fn` with merged ambient context on this async chain's zone.
   */
  runWithContext<T>(ctx: LogContext, fn: () => T | Promise<T>): T | Promise<T> {
    const parent = this.getZoneState();
    const merged: LogContext = compactLogContext({
      ...(parent?.context ?? {}),
      ...ctx,
    });
    // Preserve parent actionId if patch tried to clear it
    if (parent?.context?.actionId && !merged.actionId) {
      merged.actionId = parent.context.actionId;
    }
    const state: LogZoneState = {
      context: merged,
      // Share counters with parent so nested frames stay hierarchical.
      indexPath: parent?.indexPath ?? [0],
    };
    return this.runWithZoneState(state, fn);
  }

  /**
   * Like {@link runWithContext}, but reuses parent `actionId` when present;
   * otherwise assigns a new id.
   */
  ensureActionContext<T>(
    ctx: LogContext,
    fn: () => T | Promise<T>,
  ): T | Promise<T> {
    const parent = this.getContext();
    // Prefer live zone, then explicit continue id, then mint.
    const actionId = parent?.actionId ?? ctx.actionId ?? getUUIDv4();
    return this.runWithContext({ ...ctx, actionId }, fn);
  }

  /**
   * Generic I/O / HTTP boundary — works with fetch, axios, ky, etc.
   * Mints a distinct HTTP `requestId` (not the action id).
   * Caller owns the client; optional `status` via meta after settle is caller-driven.
   */
  trackRequest<T>(
    meta: TrackRequestMeta,
    fn: () => T | Promise<T>,
  ): T | Promise<T> {
    const requestId = getUUIDv4();
    const httpUrl = sanitizeHttpUrl(meta.url);
    const httpMethod = meta.method?.toUpperCase();
    const patch: LogContext = compactLogContext({
      span: meta.span ?? 'http.request',
      fn: meta.fn ?? 'trackRequest',
      mapId: meta.mapId,
      requestId,
      httpMethod,
      httpUrl,
    });
    const startedAt = performance.now();
    const log = this.createLogger().setNamespace('http', 0);

    return this.runWithContext(patch, () => {
      const finish = (
        outcome: 'ok' | 'error',
        status?: number,
        err?: unknown,
      ) => {
        const durationMs = Math.round(performance.now() - startedAt);
        const bound = compactLogContext({
          fn: patch.fn!,
          span: patch.span!,
          requestId,
          httpMethod,
          httpUrl,
          httpStatus: status ?? meta.status,
          durationMs,
          outcome,
          ...(err instanceof Error
            ? { errorName: err.name, errorMessage: err.message }
            : {}),
        });
        if (outcome === 'error') log.with(bound).error('HTTP_ERROR');
        else log.with(bound).debug('HTTP_DONE');
      };

      try {
        const result = fn();
        if (!isPromiseLike(result)) {
          finish('ok', meta.status);
          return result;
        }
        return Promise.resolve(result).then(
          (value) => {
            const status =
              meta.status ??
              (value &&
              typeof value === 'object' &&
              'status' in value &&
              typeof (value as { status: unknown }).status === 'number'
                ? (value as { status: number }).status
                : undefined);
            finish('ok', status);
            return value;
          },
          (err) => {
            finish('error', undefined, err);
            throw err;
          },
        ) as Promise<T>;
      } catch (err) {
        finish('error', undefined, err);
        throw err;
      }
    });
  }

  createLogger(): Logger {
    return new Logger(
      this.adapters,
      (namespaces) => this.isEnabled(namespaces),
      () => this.getContext(),
    );
  }
}
