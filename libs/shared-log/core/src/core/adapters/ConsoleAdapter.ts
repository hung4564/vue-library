import { extraString, extraValue, recordArgs } from '../record';
import { noopLogDataStore } from '../store/noop-store';
import type { LogDataStore } from '../store/types';
import type { DebugRecord, LogAdapter, LogData, LogLevel } from '../types';

const LEVEL_STYLE: Record<LogLevel, string> = {
  debug: 'color:#9aa0a6;font-weight:600',
  info: 'color:#1565c0;font-weight:600',
  warn: 'color:#ef6c00;font-weight:700',
  error: 'color:#c62828;font-weight:700',
};

const META_STYLE = 'color:#80868b;font-weight:400';
const RESET_STYLE = 'color:inherit;font-weight:400';

function formatMeta(record: DebugRecord<LogData>): string {
  const { header } = record;
  const ns = header.namespaces.map((n) => `[${n}]`).join('');
  const parts: string[] = [ns];
  const push = (text: string | undefined) => {
    if (text) parts.push(text);
  };
  if (header.index != null) push(`[#${header.index}]`);
  const mapId = extraString(record, 'mapId');
  if (mapId) push(`[mapId=${mapId}]`);
  if (header.actionId) push(`[action=${header.actionId}]`);
  const requestId = extraString(record, 'requestId');
  if (requestId) push(`[httpReq=${requestId}]`);
  if (header.span) push(`[span=${header.span}]`);
  if (header.fn) push(`[fn=${header.fn}]`);
  const eventName = extraString(record, 'eventName');
  if (eventName) push(`[event=${eventName}]`);
  if (header.spanId) push(`[spanId=${header.spanId}]`);
  if (header.parentSpanId) push(`[parentSpan=${header.parentSpanId}]`);
  const durationMs = extraValue(record, 'durationMs');
  if (durationMs != null) push(`[${durationMs}ms]`);
  const outcome = extraString(record, 'outcome');
  if (outcome) push(`[${outcome}]`);
  const control = extraString(record, 'control');
  if (control) push(`[control=${control}]`);
  const menuId = extraString(record, 'menuId');
  if (menuId) push(`[menuId=${menuId}]`);
  const menuName = extraString(record, 'menuName');
  if (menuName) push(`[menu=${menuName}]`);
  const datasetId = extraString(record, 'datasetId');
  if (datasetId) push(`[datasetId=${datasetId}]`);
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

  log(record: DebugRecord<LogData>): void {
    void this.store.append(record);
    const level = record.header.level ?? 'info';
    const levelTag = `[${level.toUpperCase()}]`;
    const meta = formatMeta(record);
    const fn = console[level].bind(console);
    const args = recordArgs(record);
    if (meta) {
      fn(`%c${levelTag}%c${meta}`, LEVEL_STYLE[level], META_STYLE, ...args);
    } else {
      fn(`%c${levelTag}%c`, LEVEL_STYLE[level], RESET_STYLE, ...args);
    }
  }
}
