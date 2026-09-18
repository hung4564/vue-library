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
  const ns = log.namespaces.filter(Boolean).join(':');
  const args = log.args.map(formatLogArg).join(' ');
  return `${formatLogTime(log.timestamp)} [${(log.level || 'unknown').toUpperCase()}]${ns ? ` [${ns}]` : ''} ${args}`.trim();
}
