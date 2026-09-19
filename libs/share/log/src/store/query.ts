import type { LogRecord } from '../types';
import type { LogFilterQuery, LogLevelFilter } from './types';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function logActionId(log: LogRecord): string | undefined {
  return log.header.actionId ?? log.header.requestId;
}

export function logSpanId(log: LogRecord): string | undefined {
  return log.header.spanId ?? (log.header as { functionId?: string }).functionId;
}

export function logMapId(log: LogRecord): string | null {
  if (log.header.mapId) return log.header.mapId;
  const namespaces = log.header.namespaces;
  if (namespaces.length > 0 && UUID_RE.test(namespaces[0]!)) {
    return namespaces[0]!;
  }
  return null;
}

export function rootNamespace(log: LogRecord): string {
  return log.header.namespaces[0] ?? '';
}

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

export function entryText(log: LogRecord): string {
  return [
    log.header.level,
    log.header.index != null ? `#${log.header.index}` : '',
    log.header.namespaces.join(':'),
    logActionId(log),
    log.header.requestId,
    log.header.span,
    log.header.fn,
    logSpanId(log),
    log.header.parentSpanId,
    log.header.control,
    log.header.menuId,
    log.header.menuName,
    log.header.datasetId,
    log.header.outcome,
    ...log.args.map((arg) => formatArg(arg)),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function compareDottedIndex(a: string, b: string): number {
  const as = a.split('.').map((x) => Number(x) || 0);
  const bs = b.split('.').map((x) => Number(x) || 0);
  const n = Math.max(as.length, bs.length);
  for (let i = 0; i < n; i++) {
    const d = (as[i] ?? 0) - (bs[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/** Prefer hierarchical method `index` (`1`, `2.1`), then `ts`, then `id`. */
export function compareLogOrder(a: LogRecord, b: LogRecord): number {
  const ai = a.header.index;
  const bi = b.header.index;
  if (ai != null && bi != null && ai !== bi) {
    return compareDottedIndex(String(ai), String(bi));
  }
  if (a.header.ts !== b.header.ts) return a.header.ts - b.header.ts;
  if (a.id !== b.id) return a.id < b.id ? -1 : 1;
  return 0;
}

/** Internal matcher for {@link LogDataStore.list} (not a public package export). */
export function matchLogRecords(
  records: LogRecord[],
  query: LogFilterQuery = {},
): LogRecord[] {
  const searchValue = query.search ?? '';
  const levelValue: LogLevelFilter = query.level ?? 'all';
  const namespaceValue = query.namespace ?? 'all';
  const mapIdValue = query.mapId ?? 'all';
  const actionIdValue = query.actionId ?? '';

  const q = searchValue.trim().toLowerCase();
  const mapFilterActive = mapIdValue !== 'all';
  const action = actionIdValue.trim().toLowerCase();

  const matched = records.filter((log) => {
    if (levelValue !== 'all' && log.header.level !== levelValue) return false;
    if (mapFilterActive && logMapId(log) !== mapIdValue) return false;
    if (namespaceValue !== 'all' && rootNamespace(log) !== namespaceValue) {
      return false;
    }
    if (action && !(logActionId(log) ?? '').toLowerCase().includes(action)) {
      return false;
    }
    if (q && !entryText(log).includes(q)) return false;
    return true;
  });

  if (action) return matched.slice().sort(compareLogOrder);
  return matched;
}
