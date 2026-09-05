import { applyWorkerMonitorMessage } from './message';
import { WorkerMonitor } from './monitor';
import {
  runMonitoredTask,
  type MonitoredTaskRun,
} from './run-task';
import type { WorkerHandle, WorkerRegisterOptions } from './types';

export type WorkerTaskRequestBase = {
  id: string;
  type: string;
};

export type WorkerTaskResponseBase = {
  id: string;
  ok: boolean;
  error?: string;
};

type PendingTask<TResponse> = {
  resolve: (value: TResponse) => void;
  reject: (reason?: unknown) => void;
};

export type WorkerMonitorConnectOptions<
  TRequest extends WorkerTaskRequestBase = WorkerTaskRequestBase,
  TResponse extends WorkerTaskResponseBase = WorkerTaskResponseBase,
> = WorkerRegisterOptions & {
  id: string;
  createWorker: () => Worker;
  /** Map a failed worker response / crash string into an Error. */
  mapError?: (raw?: string) => Error;
  /** Called when the Worker instance is created successfully. */
  onReady?: (handle: WorkerHandle) => void;
  /** Transform outbound request before postMessage (e.g. toPlainJson). */
  prepareRequest?: (payload: TRequest) => TRequest | unknown;
};

export type WorkerMonitorClient<
  TRequest extends WorkerTaskRequestBase = WorkerTaskRequestBase,
  TResponse extends WorkerTaskResponseBase = WorkerTaskResponseBase,
> = {
  readonly id: string;
  readonly handle: WorkerHandle;
  getWorker(): Worker | null;
  post(payload: TRequest): Promise<TResponse>;
  runTask<T>(
    type: string,
    primary: MonitoredTaskRun<T>,
    fallback?: MonitoredTaskRun<T>,
  ): Promise<T>;
  terminate(reason?: string): void;
};

function defaultMapError(raw?: string): Error {
  return new Error(raw?.trim() || 'Worker failed');
}

export function connectWorkerMonitor<
  TRequest extends WorkerTaskRequestBase = WorkerTaskRequestBase,
  TResponse extends WorkerTaskResponseBase = WorkerTaskResponseBase,
>(
  options: WorkerMonitorConnectOptions<TRequest, TResponse>,
): WorkerMonitorClient<TRequest, TResponse> {
  const handle = WorkerMonitor.register(options.id, { name: options.name });
  const mapError = options.mapError ?? defaultMapError;
  let worker: Worker | null = null;
  let workerUnavailable = false;
  const pending = new Map<string, PendingTask<TResponse>>();

  function rejectAll(reason: Error, failFallback = true) {
    for (const [id, task] of pending) {
      handle.failTask(id, reason.message, {
        engine: 'worker',
        fallback: failFallback,
      });
      task.reject(reason);
    }
    pending.clear();
  }

  function getWorker(): Worker | null {
    if (workerUnavailable || typeof Worker === 'undefined') {
      return null;
    }
    if (worker) return worker;

    try {
      worker = options.createWorker();
      worker.onmessage = (event: MessageEvent<unknown>) => {
        if (applyWorkerMonitorMessage(options.id, event.data)) return;
        const data = event.data as TResponse;
        if (!data || typeof data !== 'object' || typeof data.id !== 'string') {
          return;
        }
        const task = pending.get(data.id);
        if (!task) return;
        pending.delete(data.id);
        if (data.ok) {
          task.resolve(data);
          return;
        }
        task.reject(mapError(data.error));
      };
      worker.onerror = () => {
        handle.setStatus('unavailable');
        handle.setLastError('Worker crashed');
        handle.log({
          level: 'error',
          message: 'Worker crashed',
        });
        worker?.terminate();
        worker = null;
        // Allow the next getWorker() to recreate (transient / fixed crashes).
        workerUnavailable = false;
        rejectAll(new Error('Worker crashed'), true);
      };
      if (handle.snapshot().pending.length === 0) {
        handle.setStatus('idle');
      }
      handle.log({ level: 'info', message: 'Worker started' });
      options.onReady?.(handle);
      return worker;
    } catch (error) {
      workerUnavailable = true;
      const message =
        error instanceof Error ? error.message : 'Worker failed to start';
      handle.setStatus('unavailable');
      handle.setLastError(message);
      handle.log({
        level: 'error',
        message: `Worker failed to start: ${message}`,
      });
      return null;
    }
  }

  function post(payload: TRequest): Promise<TResponse> {
    const instance = getWorker();
    if (!instance) {
      return Promise.reject(new Error('Worker unavailable'));
    }
    const message = options.prepareRequest
      ? options.prepareRequest(payload)
      : payload;
    return new Promise<TResponse>((resolve, reject) => {
      pending.set(payload.id, { resolve, reject });
      instance.postMessage(message);
    });
  }

  function runTask<T>(
    type: string,
    primary: MonitoredTaskRun<T>,
    fallback?: MonitoredTaskRun<T>,
  ): Promise<T> {
    return runMonitoredTask(options.id, type, primary, fallback);
  }

  function terminate(reason = 'Worker terminated') {
    worker?.terminate();
    worker = null;
    workerUnavailable = false;
    rejectAll(new Error(reason), true);
    handle.setStatus('terminated');
    handle.setLastError(undefined);
  }

  return {
    id: options.id,
    handle,
    getWorker,
    post,
    runTask,
    terminate,
  };
}

WorkerMonitor.connect = connectWorkerMonitor;
