import type { BufferingLogEntry } from '@hungpvq/map-core/devtools';
import type { LogLevel } from '@hungpvq/shared-log';

export type LevelFilter = 'all' | 'error' | 'warn' | 'info' | 'debug';

export const LEVEL_FILTERS: LevelFilter[] = [
  'all',
  'error',
  'warn',
  'info',
  'debug',
];

export const GROUP_LEVELS = new Set<LogLevel>(['groupCollapsed', 'groupEnd']);

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type StructuredGroup = {
  id: string;
  type: 'group';
  title: string;
  collapsed: boolean;
  children: StructuredItem[];
};

export type StructuredLog = {
  id: string;
  type: 'log';
  log: BufferingLogEntry;
};

export type StructuredItem = StructuredGroup | StructuredLog;

export function logMapId(log: BufferingLogEntry): string | null {
  if (log.namespaces.length > 0 && UUID_RE.test(log.namespaces[0])) {
    return log.namespaces[0];
  }
  return null;
}

export function shortMapId(id: string): string {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}

export function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

export function namespaceKey(log: BufferingLogEntry): string {
  return log.namespaces.join(':');
}

export function displayNamespace(full: string): string {
  const parts = full.split(':');
  if (parts.length > 1 && UUID_RE.test(parts[0])) {
    return parts.slice(1).join(':');
  }
  return full;
}

export function entryText(log: BufferingLogEntry): string {
  return [log.level, namespaceKey(log), ...log.args.map((arg) => formatArg(arg))]
    .join(' ')
    .toLowerCase();
}

export function filterLogs(
  list: BufferingLogEntry[],
  searchValue: string,
  levelValue: LevelFilter,
  namespaceValue: string,
  mapIdValue: string,
  mapIdCount: number,
): BufferingLogEntry[] {
  const q = searchValue.trim().toLowerCase();
  const mapFilterActive = mapIdCount > 1 && mapIdValue !== 'all';
  const hasFilter =
    Boolean(q) ||
    levelValue !== 'all' ||
    namespaceValue !== 'all' ||
    mapFilterActive;

  return list.filter((log) => {
    if (GROUP_LEVELS.has(log.level)) {
      return !hasFilter;
    }
    if (levelValue !== 'all' && log.level !== levelValue) return false;
    if (mapFilterActive && logMapId(log) !== mapIdValue) return false;
    if (namespaceValue !== 'all' && namespaceKey(log) !== namespaceValue)
      return false;
    if (q && !entryText(log).includes(q)) return false;
    return true;
  });
}

export function buildStructuredLogs(
  list: BufferingLogEntry[],
): StructuredItem[] {
  const stack: StructuredGroup[] = [];
  const root: StructuredItem[] = [];

  list.forEach((log) => {
    if (log.level === 'groupCollapsed') {
      const group: StructuredGroup = {
        id: log.id,
        type: 'group',
        title: log.args.map((a) => String(a)).join(' '),
        collapsed: true,
        children: [],
      };

      if (stack.length > 0) stack[stack.length - 1].children.push(group);
      else root.push(group);

      stack.push(group);
      return;
    }

    if (log.level === 'groupEnd') {
      stack.pop();
      return;
    }

    const entry: StructuredLog = { id: log.id, type: 'log', log };

    if (stack.length > 0) stack[stack.length - 1].children.push(entry);
    else root.push(entry);
  });

  return root;
}

export function collectStructuredLogs(items: StructuredItem[]): BufferingLogEntry[] {
  const out: BufferingLogEntry[] = [];
  for (const item of items) {
    if (item.type === 'log') out.push(item.log);
    else out.push(...collectStructuredLogs(item.children));
  }
  return out;
}

export function collectLogMapIds(logs: BufferingLogEntry[]): string[] {
  const set = new Set<string>();
  for (const log of logs) {
    if (GROUP_LEVELS.has(log.level)) continue;
    const id = logMapId(log);
    if (id) set.add(id);
  }
  return [...set].sort();
}

export function collectNamespaces(
  logs: BufferingLogEntry[],
  mapIdValue: string,
  mapIdCount: number,
): string[] {
  const set = new Set<string>();
  const mapFilterActive = mapIdCount > 1 && mapIdValue !== 'all';
  for (const log of logs) {
    if (GROUP_LEVELS.has(log.level)) continue;
    if (mapFilterActive && logMapId(log) !== mapIdValue) continue;
    const key = namespaceKey(log);
    if (key) set.add(key);
  }
  return [...set].sort();
}

export function isObject(val: unknown): boolean {
  return val !== null && typeof val === 'object';
}

export function namespaceParts(namespaces: string[]): {
  full: string;
  path: string;
  mapId: string | null;
} {
  if (namespaces.length > 1 && UUID_RE.test(namespaces[0])) {
    return {
      full: namespaces.join(':'),
      path: namespaces.slice(1).join(':'),
      mapId: namespaces[0],
    };
  }
  return {
    full: namespaces.join(':'),
    path: namespaces.join(':'),
    mapId: null,
  };
}

export function levelLetter(level: string): string {
  return (level || '?').charAt(0).toUpperCase();
}

export function formatLogTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

export function textMessage(log: BufferingLogEntry): string {
  return log.args.filter((arg) => !isObject(arg)).map(formatArg).join(' ');
}

export function objectArgs(log: BufferingLogEntry): unknown[] {
  return log.args.filter(isObject);
}

export function countNewLogsWhilePaused(
  live: BufferingLogEntry[],
  frozen: BufferingLogEntry[] | null,
  paused: boolean,
): number {
  if (!paused || !frozen) return 0;
  const frozenIds = new Set(frozen.map((l) => l.id));
  return live.reduce((n, l) => n + (frozenIds.has(l.id) ? 0 : 1), 0);
}
