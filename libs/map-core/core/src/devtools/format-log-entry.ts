import type { BufferingLogEntry } from './BufferingLogAdapter';

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

/**
 * Format a buffering log entry for clipboard copy (devtools LogViewer).
 */
export function formatDevtoolsLogEntryForCopy(log: BufferingLogEntry): string {
  const { header, args } = log;
  const ns = header.namespaces.filter(Boolean).join(':');
  const extras: string[] = [];
  if (header.index != null) extras.push(`#${header.index}`);
  if (header.mapId) extras.push(`mapId=${header.mapId}`);
  if (header.requestId) extras.push(`req=${header.requestId}`);
  if (header.span) extras.push(`span=${header.span}`);
  if (header.fn) extras.push(`fn=${header.fn}`);
  if (header.functionId) extras.push(`functionId=${header.functionId}`);
  if (header.control) extras.push(`control=${header.control}`);
  if (header.menuId) extras.push(`menuId=${header.menuId}`);
  if (header.menuName) extras.push(`menu=${header.menuName}`);
  if (header.datasetId) extras.push(`datasetId=${header.datasetId}`);
  const extraStr = extras.length ? ` [${extras.join('][')}]` : '';
  const argsStr = args.map(formatLogArg).join(' ');
  return `${formatLogTime(header.ts)} [${(header.level || 'unknown').toUpperCase()}]${ns ? ` [${ns}]` : ''}${extraStr} ${argsStr}`.trim();
}
