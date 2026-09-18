import {
  createWorkerMonitorLogMessage,
  createWorkerMonitorProgressMessage,
  isWorkerMonitorAbortMessage,
} from './protocol';
import type { WorkerLogLevel } from './types';

export type WorkerTaskRequest = {
  id: string;
  type: string;
  [key: string]: unknown;
};

export type WorkerTaskResponse = {
  id: string;
  ok: boolean;
  error?: string;
  [key: string]: unknown;
};

export type WorkerTaskContext = {
  readonly taskId: string;
  log: (
    message: string,
    options?: { level?: WorkerLogLevel },
  ) => void;
  /** Throttled progress (~80ms, always sends when current >= total). */
  report: (current: number, total?: number, message?: string) => void;
  /** Throws AbortError when this task was cancelled from the main thread. */
  throwIfAborted: () => void;
  readonly aborted: boolean;
};

export type WorkerMonitorHandler<TRequest extends WorkerTaskRequest> = (
  message: TRequest,
  ctx: WorkerTaskContext,
) => Promise<Omit<WorkerTaskResponse, 'id' | 'ok' | 'error'> | void> | Omit<
  WorkerTaskResponse,
  'id' | 'ok' | 'error'
> | void;

export type RunWorkerMonitorOptions = {
  readyMessage?: string;
  /** Progress throttle interval in ms. Default 80. */
  progressThrottleMs?: number;
};

type ConsoleMethod = 'debug' | 'info' | 'log' | 'warn' | 'error';

function formatLogArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return arg.stack || arg.message;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');
}

function postLog(
  message: string,
  options: { level?: WorkerLogLevel; taskId?: string } = {},
) {
  self.postMessage(createWorkerMonitorLogMessage(message, options));
}

function installConsoleForwarding() {
  const patched = console as Console & { __mapWorkerConsolePatched?: boolean };
  if (patched.__mapWorkerConsolePatched) return;
  patched.__mapWorkerConsolePatched = true;

  const map: Record<ConsoleMethod, WorkerLogLevel> = {
    debug: 'debug',
    info: 'info',
    log: 'info',
    warn: 'warn',
    error: 'error',
  };
  for (const method of [
    'debug',
    'info',
    'log',
    'warn',
    'error',
  ] as const) {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      try {
        postLog(formatLogArgs(args), { level: map[method] });
      } catch {
        // Logging must not crash worker tasks.
      }
    };
  }
}

function createProgressPoster(
  taskId: string,
  throttleMs: number,
): WorkerTaskContext['report'] {
  let last = 0;
  return (current: number, total?: number, message?: string) => {
    const now = Date.now();
    const done = total != null && current >= total;
    if (!done && now - last < throttleMs) return;
    last = now;
    self.postMessage(
      createWorkerMonitorProgressMessage(taskId, current, total, message),
    );
  };
}

function createTaskContext(
  taskId: string,
  throttleMs: number,
  abortedIds: Set<string>,
): WorkerTaskContext {
  const report = createProgressPoster(taskId, throttleMs);
  const throwIfAborted = () => {
    if (!abortedIds.has(taskId)) return;
    if (typeof DOMException !== 'undefined') {
      throw new DOMException('Aborted', 'AbortError');
    }
    const err = new Error('Aborted');
    err.name = 'AbortError';
    throw err;
  };
  return {
    taskId,
    get aborted() {
      return abortedIds.has(taskId);
    },
    throwIfAborted,
    log(message, options = {}) {
      postLog(message, { level: options.level, taskId });
    },
    report(current, total, message) {
      throwIfAborted();
      report(current, total, message);
    },
  };
}

/**
 * Bind a worker's `onmessage` to WorkerMonitor envelopes + task responses.
 * Import this file relatively from Vite workers (do not pull in WorkerMonitor registry).
 */
export function runWorkerMonitor<TRequest extends WorkerTaskRequest>(
  handler: WorkerMonitorHandler<TRequest>,
  options: RunWorkerMonitorOptions = {},
): void {
  const throttleMs = options.progressThrottleMs ?? 80;
  const abortedIds = new Set<string>();
  installConsoleForwarding();
  if (options.readyMessage) {
    postLog(options.readyMessage);
  }

  self.onmessage = (event: MessageEvent<unknown>) => {
    if (isWorkerMonitorAbortMessage(event.data)) {
      abortedIds.add(event.data.taskId);
      return;
    }
    void handleMessage(
      event.data as TRequest,
      handler,
      throttleMs,
      abortedIds,
    );
  };
}

async function handleMessage<TRequest extends WorkerTaskRequest>(
  message: TRequest,
  handler: WorkerMonitorHandler<TRequest>,
  throttleMs: number,
  abortedIds: Set<string>,
) {
  const started = Date.now();
  const ctx = createTaskContext(message.id, throttleMs, abortedIds);
  try {
    ctx.throwIfAborted();
    ctx.log(`${message.type} start`);
    const result = (await handler(message, ctx)) ?? {};
    ctx.throwIfAborted();
    ctx.log(`${message.type} done in ${Date.now() - started}ms`);
    const response: WorkerTaskResponse = {
      ...result,
      id: message.id,
      ok: true,
    };
    self.postMessage(response);
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error);
    ctx.log(`${message.type} error: ${text}`, { level: 'error' });
    const response: WorkerTaskResponse = {
      id: message.id,
      ok: false,
      error: text,
    };
    self.postMessage(response);
  } finally {
    abortedIds.delete(message.id);
  }
}
