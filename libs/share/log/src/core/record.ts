import type {
  DebugHeader,
  DebugKind,
  DebugRecord,
  LiveData,
  LogContext,
  LogData,
  LogLevel,
} from './types';

const HEADER_CONTEXT_KEYS = new Set<keyof DebugHeader>([
  'actionId',
  'spanId',
  'parentSpanId',
  'fn',
  'span',
]);

const DEBUG_HEADER_KEYS = new Set([
  'ts',
  'kind',
  'namespaces',
  'index',
  'actionId',
  'spanId',
  'parentSpanId',
  'fn',
  'span',
  'level',
]);

function asString(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  return String(value);
}

export function splitLogContext(ctx: LogContext): {
  header: Pick<
    DebugHeader,
    'actionId' | 'spanId' | 'parentSpanId' | 'fn' | 'span'
  >;
  extra: Record<string, unknown>;
} {
  const header: Pick<
    DebugHeader,
    'actionId' | 'spanId' | 'parentSpanId' | 'fn' | 'span'
  > = {};
  const extra: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(ctx) as [
    keyof LogContext,
    LogContext[keyof LogContext],
  ][]) {
    if (value === undefined || value === null || value === '') continue;
    if (HEADER_CONTEXT_KEYS.has(key as keyof DebugHeader)) {
      (header as Record<string, unknown>)[key] = value;
    } else {
      extra[key] = value;
    }
  }
  return { header, extra };
}

export function isLogData(data: unknown): data is LogData {
  return (
    !!data && typeof data === 'object' && Array.isArray((data as LogData).args)
  );
}

export function isLiveData(data: unknown): data is LiveData {
  return (
    !!data &&
    typeof data === 'object' &&
    typeof (data as LiveData).event === 'string' &&
    typeof (data as LiveData).instanceId === 'string' &&
    typeof (data as LiveData).component === 'string'
  );
}

export function recordArgs(record: DebugRecord): unknown[] {
  return isLogData(record.data) ? record.data.args : [];
}

export function recordExtra(record: DebugRecord): Record<string, unknown> {
  if (isLogData(record.data) && record.data.extra) return record.data.extra;
  return {};
}

export function extraValue(record: DebugRecord, key: string): unknown {
  return recordExtra(record)[key];
}

export function extraString(
  record: DebugRecord,
  key: string,
): string | undefined {
  return asString(extraValue(record, key));
}

export type DebugHeaderRow = { key: string; value: string };

/** Shared detail rows: envelope header then `data.extra`. */
export function debugHeaderRows(record: DebugRecord): DebugHeaderRow[] {
  const h = record.header;
  const rows: DebugHeaderRow[] = [];
  const push = (key: string, value: unknown) => {
    if (value === undefined || value === null || value === '') return;
    rows.push({
      key,
      value: Array.isArray(value) ? value.join(':') : String(value),
    });
  };
  push('id', record.id);
  push('kind', h.kind);
  push('ts', h.ts);
  push('level', h.level);
  push('namespaces', h.namespaces);
  push('index', h.index);
  push('actionId', h.actionId);
  push('spanId', h.spanId);
  push('parentSpanId', h.parentSpanId);
  push('fn', h.fn);
  push('span', h.span);
  for (const [key, value] of Object.entries(recordExtra(record))) {
    push(key, value);
  }
  return rows;
}

function looksMigrated(raw: Record<string, unknown>): boolean {
  const header = raw['header'];
  const data = raw['data'];
  return (
    typeof raw['id'] === 'string' &&
    header != null &&
    typeof header === 'object' &&
    data != null &&
    typeof data === 'object' &&
    !('args' in raw) &&
    typeof (header as DebugHeader).kind === 'string'
  );
}

/** One-shot rewrite of pre-envelope `{ id, header, args }` records. */
export function migrateDebugRecord(raw: unknown): DebugRecord<LogData> {
  if (!raw || typeof raw !== 'object') {
    return {
      id: '',
      header: { ts: Date.now(), kind: 'log', namespaces: [] },
      data: { args: [] },
    };
  }
  const rec = raw as Record<string, unknown>;
  const headerIn = (rec['header'] ?? {}) as Record<string, unknown>;
  const dataRaw = rec['data'];
  const dataIn =
    dataRaw && typeof dataRaw === 'object'
      ? (dataRaw as Partial<LogData>)
      : undefined;

  const header: DebugHeader = {
    ts: Number(headerIn['ts'] ?? Date.now()),
    kind: ((headerIn['kind'] as DebugKind) ?? 'log') as DebugKind,
    namespaces: Array.isArray(headerIn['namespaces'])
      ? (headerIn['namespaces'] as string[])
      : [],
    index: headerIn['index'] != null ? String(headerIn['index']) : undefined,
    actionId: asString(headerIn['actionId']),
    spanId: asString(headerIn['spanId'] ?? headerIn['functionId']),
    parentSpanId: asString(headerIn['parentSpanId']),
    fn: asString(headerIn['fn']),
    span: asString(headerIn['span']),
    level: headerIn['level'] as LogLevel | undefined,
  };

  const extra: Record<string, unknown> = {
    ...(dataIn?.extra && typeof dataIn.extra === 'object' ? dataIn.extra : {}),
  };
  for (const [key, value] of Object.entries(headerIn)) {
    if (DEBUG_HEADER_KEYS.has(key)) continue;
    if (value === undefined || value === null || value === '') continue;
    extra[key] = value;
  }

  const args = Array.isArray(dataIn?.args)
    ? dataIn.args
    : Array.isArray(rec['args'])
      ? (rec['args'] as unknown[])
      : [];

  return {
    id: String(rec['id'] ?? ''),
    header,
    data: {
      args,
      extra: Object.keys(extra).length ? extra : undefined,
    },
  };
}

export function needsRecordRewrite(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return true;
  return !looksMigrated(raw as Record<string, unknown>);
}
