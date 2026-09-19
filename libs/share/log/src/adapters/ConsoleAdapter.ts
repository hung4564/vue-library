import type { LogAdapter, LogLevel, LogRecord } from '../types';
import { noopLogDataStore } from '../store/noop-store';
import type { LogDataStore } from '../store/types';

const LEVEL_STYLE: Record<LogLevel, string> = {
  debug: 'color:#9aa0a6;font-weight:600',
  info: 'color:#1565c0;font-weight:600',
  warn: 'color:#ef6c00;font-weight:700',
  error: 'color:#c62828;font-weight:700',
};

const META_STYLE = 'color:#80868b;font-weight:400';
const RESET_STYLE = 'color:inherit;font-weight:400';

function formatMeta(record: LogRecord): string {
  const { header } = record;
  const ns = header.namespaces.map((n) => `[${n}]`).join('');
  const parts: string[] = [ns];
  if (header.index != null) parts.push(`[#${header.index}]`);
  if (header.mapId) parts.push(`[mapId=${header.mapId}]`);
  if (header.actionId) parts.push(`[action=${header.actionId}]`);
  if (header.requestId) parts.push(`[httpReq=${header.requestId}]`);
  if (header.span) parts.push(`[span=${header.span}]`);
  if (header.fn) parts.push(`[fn=${header.fn}]`);
  if (header.eventName) parts.push(`[event=${header.eventName}]`);
  if (header.spanId) parts.push(`[spanId=${header.spanId}]`);
  if (header.parentSpanId) parts.push(`[parentSpan=${header.parentSpanId}]`);
  if (header.durationMs != null) parts.push(`[${header.durationMs}ms]`);
  if (header.outcome) parts.push(`[${header.outcome}]`);
  if (header.control) parts.push(`[control=${header.control}]`);
  if (header.menuId) parts.push(`[menuId=${header.menuId}]`);
  if (header.menuName) parts.push(`[menu=${header.menuName}]`);
  if (header.datasetId) parts.push(`[datasetId=${header.datasetId}]`);
  return parts.filter(Boolean).join('');
}

/**
 * Console sink. Pairs with {@link NoopLogDataStore} by default (no retention).
 * Pass another {@link LogDataStore} to also persist while printing.
 */
export class ConsoleAdapter implements LogAdapter {
  constructor(private readonly store: LogDataStore = noopLogDataStore) {}

  get dataStore(): LogDataStore {
    return this.store;
  }

  log(record: LogRecord): void {
    void this.store.append(record);
    const level = record.header.level;
    const levelTag = `[${level.toUpperCase()}]`;
    const meta = formatMeta(record);
    const fn = console[level].bind(console);
    if (meta) {
      fn(`%c${levelTag}%c${meta}`, LEVEL_STYLE[level], META_STYLE, ...record.args);
    } else {
      fn(`%c${levelTag}%c`, LEVEL_STYLE[level], RESET_STYLE, ...record.args);
    }
  }
}
