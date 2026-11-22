import type { DebugErrorRecord } from '../store';

export function errorContextId(
  error: DebugErrorRecord,
  key = 'mapId',
): string | null {
  const id = error.context?.[key];
  return id != null && id !== '' ? String(id) : null;
}

export function shortId(id: string): string {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}

export function collectErrorContextIds(
  errors: DebugErrorRecord[],
  key = 'mapId',
): string[] {
  const set = new Set<string>();
  for (const error of errors) {
    const id = errorContextId(error, key);
    if (id) set.add(id);
  }
  return [...set].sort();
}

export function formatErrorTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function formatDebugErrorForCopy(error: {
  message: string;
  code?: string;
  stack?: string;
  context?: unknown;
}): string {
  return [
    error.code,
    error.message,
    error.stack,
    error.context ? JSON.stringify(error.context, null, 2) : '',
  ]
    .filter(Boolean)
    .join('\n\n');
}
