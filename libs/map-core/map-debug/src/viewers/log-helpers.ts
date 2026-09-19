import type { BufferingLogEntry } from '@hungpvq/map-core/devtools';

export type LevelFilter = 'all' | 'error' | 'warn' | 'info' | 'debug';

export const LEVEL_FILTERS: LevelFilter[] = [
  'all',
  'error',
  'warn',
  'info',
  'debug',
];

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
  if (log.header.mapId) return log.header.mapId;
  const namespaces = log.header.namespaces;
  if (namespaces.length > 0 && UUID_RE.test(namespaces[0]!)) {
    return namespaces[0]!;
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
  return log.header.namespaces.join(':');
}

/** Top-level namespace segment used by the Logs filter dropdown. */
export function rootNamespace(log: BufferingLogEntry): string {
  return log.header.namespaces[0] ?? '';
}

export function displayNamespace(full: string): string {
  const parts = full.split(':');
  if (parts.length > 1 && UUID_RE.test(parts[0]!)) {
    return parts.slice(1).join(':');
  }
  return full;
}

export function entryText(log: BufferingLogEntry): string {
  return [
    log.header.level,
    log.header.index != null ? `#${log.header.index}` : '',
    namespaceKey(log),
    log.header.requestId,
    log.header.span,
    log.header.fn,
    log.header.control,
    log.header.menuId,
    log.header.menuName,
    log.header.datasetId,
    ...log.args.map((arg) => formatArg(arg)),
  ]
    .filter(Boolean)
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
  requestIdValue = '',
): BufferingLogEntry[] {
  const q = searchValue.trim().toLowerCase();
  const mapFilterActive = mapIdValue !== 'all';
  const req = requestIdValue.trim().toLowerCase();

  return list.filter((log) => {
    if (levelValue !== 'all' && log.header.level !== levelValue) return false;
    if (mapFilterActive && logMapId(log) !== mapIdValue) return false;
    if (namespaceValue !== 'all' && rootNamespace(log) !== namespaceValue)
      return false;
    if (
      req &&
      !(log.header.requestId ?? '').toLowerCase().includes(req)
    ) {
      return false;
    }
    if (q && !entryText(log).includes(q)) return false;
    return true;
  });
}

/** Flat list of log entries (no console.group nesting). */
export function buildStructuredLogs(
  list: BufferingLogEntry[],
): StructuredItem[] {
  return list.map((log) => ({ id: log.id, type: 'log' as const, log }));
}

export function collectStructuredLogs(
  items: StructuredItem[],
): BufferingLogEntry[] {
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
  const mapFilterActive = mapIdValue !== 'all';
  for (const log of logs) {
    if (mapFilterActive && logMapId(log) !== mapIdValue) continue;
    const key = rootNamespace(log);
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
  if (namespaces.length > 1 && UUID_RE.test(namespaces[0]!)) {
    return {
      full: namespaces.join(':'),
      path: namespaces.slice(1).join(':'),
      mapId: namespaces[0]!,
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

/** Exact requestId match, chronological (oldest first). */
export function collectLogsByRequestId(
  list: BufferingLogEntry[],
  requestId: string,
): BufferingLogEntry[] {
  const id = requestId.trim();
  if (!id) return [];
  return list
    .filter((log) => log.header.requestId === id)
    .slice()
    .sort(compareLogOrder);
}

/** Prefer monotonic `index`, then `ts`. */
export function compareLogOrder(
  a: BufferingLogEntry,
  b: BufferingLogEntry,
): number {
  const ai = a.header.index;
  const bi = b.header.index;
  if (ai != null && bi != null && ai !== bi) return ai - bi;
  if (a.header.ts !== b.header.ts) return a.header.ts - b.header.ts;
  return 0;
}

export type RequestFlowStep = {
  id: string;
  ts: number;
  index?: number;
  deltaMs: number;
  level: string;
  namespace: string;
  message: string;
  label: string;
  span?: string;
  fn?: string;
  control?: string;
  menu?: string;
  flowKind?: string;
  eventName?: string;
  parentFn?: string;
  functionId?: string;
  flowDepth: number;
  /** START | END | ERROR | EMIT | mid */
  phase?: string;
};

export function buildRequestFlowSteps(
  logs: BufferingLogEntry[],
): RequestFlowStep[] {
  if (logs.length === 0) return [];
  const t0 = logs[0]!.header.ts;
  return logs.map((log) => toRequestFlowStep(log, t0));
}

function toRequestFlowStep(
  log: BufferingLogEntry,
  t0: number,
): RequestFlowStep {
  const message = textMessage(log);
  const namespace = rootNamespace(log) || namespaceKey(log);
  const menu = log.header.menuName || log.header.menuId;
  const flowKind = log.header.flowKind;
  const eventName = log.header.eventName;
  const fn = log.header.fn;

  let phase: string | undefined;
  if (message === 'START' || message === 'END' || message === 'ERROR') {
    phase = message;
  } else if (message === 'EMIT' || flowKind === 'emit') {
    phase = 'EMIT';
  } else {
    phase = 'mid';
  }

  let label: string;
  if (flowKind === 'emit' || phase === 'EMIT') {
    label = `emit ${eventName || '?'}`;
  } else if (phase === 'START' || phase === 'END' || phase === 'ERROR') {
    label = fn ? `${fn} · ${phase}` : phase;
  } else if (message) {
    label = message;
  } else {
    label =
      fn ||
      log.header.span ||
      log.header.control ||
      menu ||
      namespace ||
      '(log)';
  }

  return {
    id: log.id,
    ts: log.header.ts,
    index: log.header.index,
    deltaMs: log.header.ts - t0,
    level: log.header.level || 'info',
    namespace,
    message,
    label,
    span: log.header.span,
    fn,
    control: log.header.control,
    menu,
    flowKind,
    eventName,
    parentFn: log.header.parentFn,
    functionId: log.header.functionId,
    flowDepth: log.header.flowDepth ?? 0,
    phase,
  };
}

export type RequestFlowTreeNode = RequestFlowStep & {
  children: RequestFlowTreeNode[];
};

/**
 * Nest request logs into a call / emit / handler tree.
 *
 * - `START` opens a function frame (keyed by `functionId` when present)
 * - Mid logs with the same `functionId` nest under that frame (including after END)
 * - `END` / `ERROR` close the open stack; children stay in write order (`index`)
 * - `emit` + handlers fan-out as sibling branches under the emit node
 *
 * Never reorders children — timeline follows {@link compareLogOrder}.
 */
export function buildRequestFlowTree(
  logs: BufferingLogEntry[],
): RequestFlowTreeNode[] {
  if (logs.length === 0) return [];
  const ordered = logs.slice().sort(compareLogOrder);
  const t0 = ordered[0]!.header.ts;
  const nodes: RequestFlowTreeNode[] = ordered.map((log) => ({
    ...toRequestFlowStep(log, t0),
    children: [],
  }));

  const roots: RequestFlowTreeNode[] = [];
  /** Open function frames (START nodes), outermost → innermost. */
  const fnStack: RequestFlowTreeNode[] = [];
  const emitStack: RequestFlowTreeNode[] = [];
  /** START frames by functionId (survives after END so late logs stay under the call). */
  const framesByFunctionId = new Map<string, RequestFlowTreeNode>();

  const topFn = () =>
    fnStack.length > 0 ? fnStack[fnStack.length - 1]! : undefined;

  const attach = (node: RequestFlowTreeNode, parent?: RequestFlowTreeNode) => {
    if (parent) parent.children.push(node);
    else roots.push(node);
  };

  const findOpenFnFrame = (
    functionId?: string,
  ): RequestFlowTreeNode | undefined => {
    if (!functionId) return topFn();
    for (let i = fnStack.length - 1; i >= 0; i--) {
      if (fnStack[i]!.functionId === functionId) return fnStack[i];
    }
    return topFn();
  };

  const resolveFnFrame = (
    functionId?: string,
  ): RequestFlowTreeNode | undefined => {
    if (functionId && framesByFunctionId.has(functionId)) {
      return framesByFunctionId.get(functionId);
    }
    return findOpenFnFrame(functionId);
  };

  for (const node of nodes) {
    const phase = node.phase;

    if (node.flowKind === 'emit' || phase === 'EMIT') {
      attach(node, topFn());
      emitStack.push(node);
      continue;
    }

    if (node.flowKind === 'handler' && phase === 'START') {
      let emitParent: RequestFlowTreeNode | undefined;
      if (node.eventName) {
        for (let i = emitStack.length - 1; i >= 0; i--) {
          if (emitStack[i]!.eventName === node.eventName) {
            emitParent = emitStack[i];
            break;
          }
        }
      }
      attach(node, emitParent ?? topFn());
      fnStack.push(node);
      if (node.functionId) framesByFunctionId.set(node.functionId, node);
      continue;
    }

    if (phase === 'START') {
      attach(node, topFn());
      fnStack.push(node);
      if (node.functionId) framesByFunctionId.set(node.functionId, node);
      continue;
    }

    if (phase === 'END' || phase === 'ERROR') {
      const frame = resolveFnFrame(node.functionId);
      if (frame) {
        frame.children.push(node);
        const idx = fnStack.lastIndexOf(frame);
        if (idx >= 0) fnStack.length = idx;
      } else {
        attach(node);
      }
      continue;
    }

    const frame = resolveFnFrame(node.functionId);
    if (frame) {
      frame.children.push(node);
    } else {
      attach(node);
    }
  }

  return roots;
}

export function formatFlowDelta(ms: number): string {
  if (ms <= 0) return '0ms';
  if (ms < 1000) return `+${ms}ms`;
  return `+${(ms / 1000).toFixed(2)}s`;
}

export function shortRequestId(id: string): string {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}
