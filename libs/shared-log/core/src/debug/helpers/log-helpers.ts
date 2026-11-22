import { compareLogOrder, logSpanId, rootNamespace } from '../../core';
import {
  extraString,
  isLiveData,
  isLogData,
  recordArgs,
  recordExtra,
} from '../../core/record';
import type { DebugRecord } from '../../core/types';

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

function namespaceKey(log: DebugRecord): string {
  return log.header.namespaces.join(':');
}

export function formatLogTime(ts: number): string {
  return new Date(ts).toLocaleTimeString();
}

export function textMessage(log: DebugRecord): string {
  if (isLogData(log.data)) {
    return log.data.args
      .filter((arg) => !isObject(arg))
      .map(formatArg)
      .join(' ');
  }
  if (isLiveData(log.data)) {
    return `${log.data.event} · ${log.data.component}`;
  }
  return '';
}

export function objectArgs(log: DebugRecord): unknown[] {
  return recordArgs(log).filter(
    (arg) => arg !== null && typeof arg === 'object',
  );
}

/** Safe JSON for detail/copy — tolerates cycles and non-POJO values. */
export function stringifyDebugRecord(log: DebugRecord): string {
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

export function buildRequestFlowSteps(logs: DebugRecord[]): RequestFlowStep[] {
  if (logs.length === 0) return [];
  const t0 = logs[0]!.header.ts;
  return logs.map((log) => toRequestFlowStep(log, t0));
}

function toRequestFlowStep(log: DebugRecord, t0: number): RequestFlowStep {
  const extra = recordExtra(log);
  const message = textMessage(log);
  const namespace = rootNamespace(log) || namespaceKey(log);
  const menu = extraString(log, 'menuName') || extraString(log, 'menuId');
  const flowKind = extraString(log, 'flowKind');
  const eventName = extraString(log, 'eventName');
  const fn = log.header.fn;
  const spanId = logSpanId(log);
  const durationMs =
    typeof extra['durationMs'] === 'number' ? extra['durationMs'] : undefined;
  const flowDepth =
    typeof extra['flowDepth'] === 'number' ? extra['flowDepth'] : 0;

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
      extraString(log, 'control') ||
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
    control: extraString(log, 'control'),
    menu,
    flowKind,
    eventName,
    parentFn: extraString(log, 'parentFn'),
    spanId,
    parentSpanId: log.header.parentSpanId,
    durationMs,
    outcome: extraString(log, 'outcome'),
    flowDepth,
    phase,
  };
}

export type RequestFlowTreeNode = RequestFlowStep & {
  children: RequestFlowTreeNode[];
};

/**
 * Nest action logs into a call / emit / handler tree.
 */
export function buildRequestFlowTree(
  logs: DebugRecord[],
): RequestFlowTreeNode[] {
  if (logs.length === 0) return [];
  const ordered = logs.slice().sort(compareLogOrder);
  const t0 = ordered[0]!.header.ts;
  const nodes: RequestFlowTreeNode[] = ordered.map((log) => ({
    ...toRequestFlowStep(log, t0),
    children: [],
  }));

  const roots: RequestFlowTreeNode[] = [];
  const fnStack: RequestFlowTreeNode[] = [];
  const emitStack: RequestFlowTreeNode[] = [];
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
