export type WorkerRuntimeStatus =
  | 'not-started'
  | 'idle'
  | 'busy'
  | 'unavailable'
  | 'terminated';

export type WorkerEngine = 'worker' | 'main';

export type WorkerTaskStatus = 'running' | 'ok' | 'error';

export type WorkerProgress = {
  current: number;
  total?: number;
  message?: string;
};

export type WorkerTaskSnapshot = {
  id: string;
  type: string;
  status: WorkerTaskStatus;
  engine: WorkerEngine;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
  progress?: WorkerProgress;
  error?: string;
  fallback?: boolean;
};

export type WorkerLogLevel = 'debug' | 'info' | 'warn' | 'error';

export type WorkerLogEntry = {
  id: string;
  at: number;
  level: WorkerLogLevel;
  message: string;
  taskId?: string;
};

export type WorkerStats = {
  ok: number;
  error: number;
  fallback: number;
};

export type WorkerSnapshot = {
  id: string;
  name: string;
  status: WorkerRuntimeStatus;
  lastError?: string;
  pending: WorkerTaskSnapshot[];
  history: WorkerTaskSnapshot[];
  logs: WorkerLogEntry[];
  stats: WorkerStats;
};

export type WorkerRegisterOptions = {
  name?: string;
};

export type WorkerHandle = {
  readonly id: string;
  setName(name: string): void;
  setStatus(status: WorkerRuntimeStatus): void;
  setLastError(error?: string): void;
  startTask(input: {
    id?: string;
    type: string;
    engine?: WorkerEngine;
  }): string;
  setProgress(taskId: string, progress: WorkerProgress): void;
  log(entry: {
    level?: WorkerLogLevel;
    message: string;
    taskId?: string;
  }): void;
  completeTask(taskId: string, result?: { engine?: WorkerEngine }): void;
  failTask(
    taskId: string,
    error: string,
    result?: { engine?: WorkerEngine; fallback?: boolean },
  ): void;
  clearHistory(): void;
  unregister(): void;
  snapshot(): WorkerSnapshot;
};

export type WorkerMonitorLogMessage = {
  __workerMonitor: true;
  kind: 'log';
  message: string;
  level?: WorkerLogLevel;
  taskId?: string;
  at?: number;
};

export type WorkerMonitorProgressMessage = {
  __workerMonitor: true;
  kind: 'progress';
  taskId: string;
  current: number;
  total?: number;
  message?: string;
};
