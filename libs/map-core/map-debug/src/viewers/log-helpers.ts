import type { LogRecord } from '@hungpvq/shared-log';
import { compareLogOrder, logSpanId, rootNamespace } from '@hungpvq/shared-log';

export type LevelFilter = 'all' | 'error' | 'warn' | 'info' | 'debug';

export const LEVEL_FILTERS: LevelFilter[] = [
  'all',
  'error',
  'warn',
  'info',
  'debug',
];

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function isObject(val: unknown): boolean {
  return val !== null && typeof val === 'object';
}

function namespaceKey(log: LogRecord): string {
  return log.header.namespaces.join(':');
}

export function formatLogTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

export function textMessage(log: LogRecord): string {
  return log.args
    .filter((arg) => !isObject(arg))
    .map(formatArg)
    .join(' ');
}

export function objectArgs(log: LogRecord): unknown[] {
  return log.args.filter(isObject);
}

/** Safe JSON for detail/copy — tolerates cycles and non-POJO values. */
export function stringifyLogRecord(log: LogRecord): string {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(
      log,
      (_key, value) => {
        if (typeof value === 'function') {
          return `[Function ${value.name || 'anonymous'}]`;
        }
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) return '[Circular]';
          seen.add(value);
        }
        return value;
      },
      2,
    );
  } catch (err) {
    return String(err instanceof Error ? err.message : err);
  }
}

export type RequestFlowStep = {
  id: string;
  ts: number;
  index?: string;
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
  spanId?: string;
  parentSpanId?: string;
  durationMs?: number;
  outcome?: string;
  flowDepth: number;
  /** START | END | ERROR | EMIT | mid */
  phase?: string;
};

export function buildRequestFlowSteps(logs: LogRecord[]): RequestFlowStep[] {
  if (logs.length === 0) return [];
  const t0 = logs[0]!.header.ts;
  return logs.map((log) => toRequestFlowStep(log, t0));
}

function toRequestFlowStep(log: LogRecord, t0: number): RequestFlowStep {
  const message = textMessage(log);
  const namespace = rootNamespace(log) || namespaceKey(log);
  const menu = log.header.menuName || log.header.menuId;
  const flowKind = log.header.flowKind;
  const eventName = log.header.eventName;
  const fn = log.header.fn;
  const spanId = logSpanId(log);

  let phase: string | undefined;
  if (message === 'START' || message === 'END' || message === 'ERROR') {
    phase = message;
  } else if (
    message === 'EMIT' ||
    message.startsWith('EMIT ') ||
    flowKind === 'emit'
  ) {
    phase = 'EMIT';
  } else {
    phase = 'mid';
  }

  let label: string;
  if (flowKind === 'emit' || phase === 'EMIT') {
    const fromMsg = message.startsWith('EMIT ')
      ? message.slice(5).trim()
      : undefined;
    label = `emit ${eventName || fromMsg || '?'}`;
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
    spanId,
    parentSpanId: log.header.parentSpanId,
    durationMs: log.header.durationMs,
    outcome: log.header.outcome,
    flowDepth: log.header.flowDepth ?? 0,
    phase,
  };
}

export type RequestFlowTreeNode = RequestFlowStep & {
  children: RequestFlowTreeNode[];
};

/**
 * Nest action logs into a call / emit / handler tree.
 *
 * - `START` opens a function frame (keyed by `spanId` when present)
 * - Mid logs with the same `spanId` nest under that frame (including after END)
 * - `END` / `ERROR` close the open stack; children stay in write order (`index`)
 * - `emit` + handlers fan-out as sibling branches under the emit node
 *
 * Never reorders children — timeline follows {@link compareLogOrder}.
 */
export function buildRequestFlowTree(logs: LogRecord[]): RequestFlowTreeNode[] {
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
  /** START frames by spanId (survives after END so late logs stay under the call). */
  const framesBySpanId = new Map<string, RequestFlowTreeNode>();

  const topFn = () =>
    fnStack.length > 0 ? fnStack[fnStack.length - 1]! : undefined;

  const attach = (node: RequestFlowTreeNode, parent?: RequestFlowTreeNode) => {
    if (parent) parent.children.push(node);
    else roots.push(node);
  };

  const findOpenFnFrame = (
    spanId?: string,
  ): RequestFlowTreeNode | undefined => {
    if (!spanId) return topFn();
    for (let i = fnStack.length - 1; i >= 0; i--) {
      if (fnStack[i]!.spanId === spanId) return fnStack[i];
    }
    return topFn();
  };

  const resolveFnFrame = (spanId?: string): RequestFlowTreeNode | undefined => {
    if (spanId && framesBySpanId.has(spanId)) {
      return framesBySpanId.get(spanId);
    }
    return findOpenFnFrame(spanId);
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
      if (node.spanId) framesBySpanId.set(node.spanId, node);
      continue;
    }

    if (phase === 'START') {
      attach(node, topFn());
      fnStack.push(node);
      if (node.spanId) framesBySpanId.set(node.spanId, node);
      continue;
    }

    if (phase === 'END' || phase === 'ERROR') {
      const frame = resolveFnFrame(node.spanId);
      if (frame) {
        frame.children.push(node);
        const idx = fnStack.lastIndexOf(frame);
        if (idx >= 0) fnStack.length = idx;
      } else {
        attach(node);
      }
      continue;
    }

    const frame = resolveFnFrame(node.spanId);
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

export function shortActionId(id: string): string {
  return id.length > 13 ? `${id.slice(0, 8)}…` : id;
}
