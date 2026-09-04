import type {
  WorkerEngine,
  WorkerHandle,
  WorkerLogEntry,
  WorkerLogLevel,
  WorkerProgress,
  WorkerRegisterOptions,
  WorkerRuntimeStatus,
  WorkerSnapshot,
  WorkerStats,
  WorkerTaskSnapshot,
} from './types';

const HISTORY_LIMIT = 5;
const LOG_LIMIT = 120;
const TASK_LOG_LIMIT = 80;
/** Compact log lines kept on each finished task for Recent tasks. */
const HISTORY_TASK_LOG_LIMIT = 8;

type WorkerEntry = {
  id: string;
  name: string;
  status: WorkerRuntimeStatus;
  lastError?: string;
  pending: WorkerTaskSnapshot[];
  history: WorkerTaskSnapshot[];
  /** Committed worker log (newest-first). Does not include live pending-task logs. */
  logs: WorkerLogEntry[];
  stats: WorkerStats;
  handle: WorkerHandle;
};

const workers = new Map<string, WorkerEntry>();
const listeners = new Set<() => void>();

function trimNewestFirst(logs: WorkerLogEntry[], limit: number) {
  if (logs.length > limit) logs.length = limit;
}

function emptyStats(): WorkerStats {
  return { ok: 0, error: 0, fallback: 0 };
}

function cloneLog(log: WorkerLogEntry): WorkerLogEntry {
  return { ...log };
}

function cloneTask(task: WorkerTaskSnapshot): WorkerTaskSnapshot {
  return {
    ...task,
    progress: task.progress ? { ...task.progress } : undefined,
    logs: task.logs?.map(cloneLog),
  };
}

function cloneSnapshot(entry: WorkerEntry): WorkerSnapshot {
  return {
    id: entry.id,
    name: entry.name,
    status: entry.status,
    lastError: entry.lastError,
    pending: entry.pending.map(cloneTask),
    history: entry.history.map(cloneTask),
    logs: entry.logs.map(cloneLog),
    stats: { ...entry.stats },
  };
}

function notify() {
  for (const listener of listeners) {
    try {
      listener();
    } catch {
      // Listener errors must not break worker tracking.
    }
  }
}

function createTaskId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `worker-task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function findPending(entry: WorkerEntry, taskId: string) {
  return entry.pending.find((task) => task.id === taskId);
}

function hasWorkerPending(entry: WorkerEntry) {
  return entry.pending.some((task) => task.engine === 'worker');
}

function pushLog(logs: WorkerLogEntry[], entry: WorkerLogEntry, limit: number) {
  logs.unshift(entry);
  trimNewestFirst(logs, limit);
}

/** Drop finished tasks beyond HISTORY_LIMIT and purge their logs from RAM. */
function trimHistory(entry: WorkerEntry) {
  if (entry.history.length <= HISTORY_LIMIT) return;
  const dropped = entry.history.splice(HISTORY_LIMIT);
  const droppedIds = new Set(dropped.map((task) => task.id));
  entry.logs = entry.logs.filter(
    (log) => !log.taskId || !droppedIds.has(log.taskId),
  );
  for (const task of dropped) {
    task.logs = undefined;
    task.progress = undefined;
  }
}

/** Keep a compact copy on the task and mirror it into the committed worker log. */
function flushTaskLogs(entry: WorkerEntry, task: WorkerTaskSnapshot) {
  const taskLogs = task.logs;
  if (!taskLogs?.length) {
    delete task.logs;
    return;
  }
  // Drop live verbosity before committing — Recent tasks + Worker log share this cap.
  trimNewestFirst(taskLogs, HISTORY_TASK_LOG_LIMIT);
  task.logs = taskLogs;
  for (let i = taskLogs.length - 1; i >= 0; i -= 1) {
    entry.logs.unshift(cloneLog(taskLogs[i]));
  }
  trimNewestFirst(entry.logs, LOG_LIMIT);
}

function finishTask(
  entry: WorkerEntry,
  taskId: string,
  patch: Partial<WorkerTaskSnapshot>,
) {
  const index = entry.pending.findIndex((task) => task.id === taskId);
  if (index < 0) return;
  const task = entry.pending[index];
  entry.pending.splice(index, 1);
  flushTaskLogs(entry, task);
  const endedAt = Date.now();
  entry.history.unshift({
    ...task,
    ...patch,
    progress: undefined,
    endedAt,
    durationMs: endedAt - task.startedAt,
  });
  trimHistory(entry);
  if (entry.status === 'busy' && !hasWorkerPending(entry)) {
    entry.status = 'idle';
  }
  notify();
}

function createHandle(entry: WorkerEntry): WorkerHandle {
  const handle: WorkerHandle = {
    get id() {
      return entry.id;
    },
    setName(name: string) {
      entry.name = name;
      notify();
    },
    setStatus(status: WorkerRuntimeStatus) {
      entry.status = status;
      notify();
    },
    setLastError(error?: string) {
      entry.lastError = error || undefined;
      notify();
    },
    startTask(input) {
      const id = input.id || createTaskId();
      const engine: WorkerEngine = input.engine ?? 'worker';
      const existing = findPending(entry, id);
      if (existing) return id;
      entry.pending.push({
        id,
        type: input.type,
        status: 'running',
        engine,
        startedAt: Date.now(),
        logs: [],
      });
      if (
        engine === 'worker' &&
        (entry.status === 'idle' || entry.status === 'not-started')
      ) {
        entry.status = 'busy';
      }
      notify();
      return id;
    },
    setProgress(taskId: string, progress: WorkerProgress) {
      const task = findPending(entry, taskId);
      if (!task) return;
      task.progress = { ...progress };
      notify();
    },
    log(input) {
      const level: WorkerLogLevel = input.level ?? 'info';
      const logEntry: WorkerLogEntry = {
        id: createTaskId(),
        at: Date.now(),
        level,
        message: input.message,
        taskId: input.taskId,
      };

      // Task-scoped logs stay on the pending task until it finishes.
      if (input.taskId) {
        const task = findPending(entry, input.taskId);
        if (task) {
          if (!task.logs) task.logs = [];
          pushLog(task.logs, logEntry, TASK_LOG_LIMIT);
          notify();
          return;
        }
      }

      // Worker-level (or orphan) logs go straight to the committed worker log.
      pushLog(entry.logs, logEntry, LOG_LIMIT);
      notify();
    },
    completeTask(taskId: string, result) {
      const task = findPending(entry, taskId);
      if (!task) return;
      const engine = result?.engine ?? task.engine;
      if (engine === 'worker') entry.stats.ok += 1;
      else entry.stats.fallback += 1;
      finishTask(entry, taskId, {
        status: 'ok',
        engine,
        error: undefined,
      });
    },
    failTask(taskId: string, error: string, result) {
      const task = findPending(entry, taskId);
      if (!task) return;
      const engine = result?.engine ?? task.engine;
      entry.lastError = error;
      if (!result?.fallback) entry.stats.error += 1;
      finishTask(entry, taskId, {
        status: 'error',
        engine,
        error,
        fallback: result?.fallback,
      });
    },
    clearHistory() {
      entry.history = [];
      entry.logs = [];
      for (const task of entry.pending) {
        task.logs = [];
      }
      entry.lastError = undefined;
      notify();
    },
    unregister() {
      WorkerMonitor.unregister(entry.id);
    },
    snapshot() {
      return cloneSnapshot(entry);
    },
  };
  return handle;
}

type ConnectFn = typeof import('./client').connectWorkerMonitor;

export const WorkerMonitor: {
  register(id: string, options?: WorkerRegisterOptions): WorkerHandle;
  ensure(id: string, options?: WorkerRegisterOptions): WorkerHandle;
  unregister(id: string): void;
  getHandle(id: string): WorkerHandle | undefined;
  get(id: string): WorkerSnapshot | undefined;
  list(): WorkerSnapshot[];
  clearHistory(id?: string): void;
  clearAllHistory(): void;
  subscribe(listener: () => void): () => void;
  /** Wired by `./client` when the worker barrel is loaded. */
  connect: ConnectFn;
} = {
  register(id: string, options: WorkerRegisterOptions = {}): WorkerHandle {
    const existing = workers.get(id);
    if (existing) {
      if (options.name) existing.name = options.name;
      return existing.handle;
    }
    const entry: WorkerEntry = {
      id,
      name: options.name || id,
      status: 'not-started',
      pending: [],
      history: [],
      logs: [],
      stats: emptyStats(),
      handle: null as unknown as WorkerHandle,
    };
    entry.handle = createHandle(entry);
    workers.set(id, entry);
    notify();
    return entry.handle;
  },

  ensure(id: string, options: WorkerRegisterOptions = {}): WorkerHandle {
    return this.register(id, options);
  },

  unregister(id: string) {
    if (!workers.delete(id)) return;
    notify();
  },

  getHandle(id: string): WorkerHandle | undefined {
    return workers.get(id)?.handle;
  },

  get(id: string): WorkerSnapshot | undefined {
    const entry = workers.get(id);
    return entry ? cloneSnapshot(entry) : undefined;
  },

  list(): WorkerSnapshot[] {
    return [...workers.values()].map(cloneSnapshot);
  },

  clearHistory(id?: string) {
    if (id) {
      workers.get(id)?.handle.clearHistory();
      return;
    }
    this.clearAllHistory();
  },

  clearAllHistory() {
    for (const entry of workers.values()) {
      entry.history = [];
      entry.logs = [];
      for (const task of entry.pending) {
        task.logs = [];
      }
      entry.lastError = undefined;
    }
    notify();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // Assigned in `./client` to avoid a circular import at module init.
  connect: null as unknown as ConnectFn,
};
