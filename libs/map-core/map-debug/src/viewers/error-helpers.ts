import type { DevtoolErrorRecord } from '@hungpvq/map-core/devtools';

export function errorMapId(error: DevtoolErrorRecord): string | null {
  const id = (error.context as { mapId?: string } | undefined)?.mapId;
  return id ? String(id) : null;
}

export function shortMapId(id: string): string {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}

export function collectErrorMapIds(errors: DevtoolErrorRecord[]): string[] {
  const set = new Set<string>();
  for (const error of errors) {
    const id = errorMapId(error);
    if (id) set.add(id);
  }
  return [...set].sort();
}

export function filterErrorsByMapId(
  errors: DevtoolErrorRecord[],
  mapIdValue: string,
): DevtoolErrorRecord[] {
  if (mapIdValue === 'all') return errors;
  return errors.filter((error) => errorMapId(error) === mapIdValue);
}

export function formatErrorTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function formatDevtoolErrorForCopy(error: {
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
