import { extraString, extraValue, recordArgs } from '../../core/record';
import type { DebugRecord } from '../../core/types';

function formatLogArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg, null, 2);
  } catch {
    return String(arg);
  }
}

function formatLogTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString();
  } catch {
    return String(ts);
  }
}

/** Format a log record for clipboard copy (LogViewer). */
export function formatDebugLogEntryForCopy(log: DebugRecord): string {
  const { header } = log;
  const ns = header.namespaces.filter(Boolean).join(':');
  const extras: string[] = [];
  if (header.index != null) extras.push(`#${header.index}`);
  const mapId = extraString(log, 'mapId');
  if (mapId) extras.push(`mapId=${mapId}`);
  if (header.actionId) extras.push(`action=${header.actionId}`);
  const requestId = extraString(log, 'requestId');
  if (requestId) extras.push(`httpReq=${requestId}`);
  if (header.span) extras.push(`span=${header.span}`);
  if (header.fn) extras.push(`fn=${header.fn}`);
  if (header.spanId) extras.push(`spanId=${header.spanId}`);
  if (header.parentSpanId) extras.push(`parentSpan=${header.parentSpanId}`);
  const durationMs = extraValue(log, 'durationMs');
  if (durationMs != null) extras.push(`${durationMs}ms`);
  const outcome = extraString(log, 'outcome');
  if (outcome) extras.push(`outcome=${outcome}`);
  const control = extraString(log, 'control');
  if (control) extras.push(`control=${control}`);
  const menuId = extraString(log, 'menuId');
  if (menuId) extras.push(`menuId=${menuId}`);
  const menuName = extraString(log, 'menuName');
  if (menuName) extras.push(`menu=${menuName}`);
  const datasetId = extraString(log, 'datasetId');
  if (datasetId) extras.push(`datasetId=${datasetId}`);
  const extraStr = extras.length ? ` [${extras.join('][')}]` : '';
  const argsStr = recordArgs(log).map(formatLogArg).join(' ');
  return `${formatLogTime(header.ts)} [${(header.level || 'unknown').toUpperCase()}]${ns ? ` [${ns}]` : ''}${extraStr} ${argsStr}`.trim();
}
