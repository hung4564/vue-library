import type {
  WorkerLogLevel,
  WorkerMonitorLogMessage,
  WorkerMonitorProgressMessage,
} from './types';

export function isWorkerMonitorProgressMessage(
  data: unknown,
): data is WorkerMonitorProgressMessage {
  if (!data || typeof data !== 'object') return false;
  const value = data as Partial<WorkerMonitorProgressMessage>;
  return (
    value.__workerMonitor === true &&
    value.kind === 'progress' &&
    typeof value.taskId === 'string' &&
    typeof value.current === 'number'
  );
}

export function isWorkerMonitorLogMessage(
  data: unknown,
): data is WorkerMonitorLogMessage {
  if (!data || typeof data !== 'object') return false;
  const value = data as Partial<WorkerMonitorLogMessage>;
  return (
    value.__workerMonitor === true &&
    value.kind === 'log' &&
    typeof value.message === 'string'
  );
}

export function createWorkerMonitorProgressMessage(
  taskId: string,
  current: number,
  total?: number,
  message?: string,
): WorkerMonitorProgressMessage {
  return {
    __workerMonitor: true,
    kind: 'progress',
    taskId,
    current,
    total,
    message,
  };
}

export function createWorkerMonitorLogMessage(
  message: string,
  options: { level?: WorkerLogLevel; taskId?: string } = {},
): WorkerMonitorLogMessage {
  return {
    __workerMonitor: true,
    kind: 'log',
    message,
    level: options.level ?? 'info',
    taskId: options.taskId,
    at: Date.now(),
  };
}
