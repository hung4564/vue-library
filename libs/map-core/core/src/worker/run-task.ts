import { WorkerMonitor } from './monitor';
import type { WorkerEngine } from './types';

export type MonitoredTaskRun<T> = {
  engine: WorkerEngine;
  run: (taskId: string) => Promise<T>;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runMonitoredTask<T>(
  workerId: string,
  type: string,
  primary: MonitoredTaskRun<T>,
  fallback?: MonitoredTaskRun<T>,
): Promise<T> {
  const handle = WorkerMonitor.ensure(workerId);
  const taskId = handle.startTask({ type, engine: primary.engine });
  try {
    const result = await primary.run(taskId);
    handle.completeTask(taskId, { engine: primary.engine });
    return result;
  } catch (error) {
    handle.failTask(taskId, errorMessage(error), {
      engine: primary.engine,
      fallback: !!fallback,
    });
    if (!fallback) {
      handle.log({
        level: 'error',
        taskId,
        message: `${type} failed on ${primary.engine}: ${errorMessage(error)}`,
      });
      throw error;
    }
    handle.log({
      level: 'warn',
      taskId,
      message: `${type} failed on ${primary.engine}, fallback to ${fallback.engine}: ${errorMessage(error)}`,
    });

    const fallbackId = handle.startTask({ type, engine: fallback.engine });
    try {
      const result = await fallback.run(fallbackId);
      handle.completeTask(fallbackId, { engine: fallback.engine });
      return result;
    } catch (fallbackError) {
      handle.failTask(fallbackId, errorMessage(fallbackError), {
        engine: fallback.engine,
      });
      handle.log({
        level: 'error',
        taskId: fallbackId,
        message: `${type} failed on ${fallback.engine}: ${errorMessage(fallbackError)}`,
      });
      throw fallbackError;
    }
  }
}
