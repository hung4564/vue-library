import { WorkerMonitor } from './monitor';
import {
  isWorkerMonitorLogMessage,
  isWorkerMonitorProgressMessage,
} from './protocol';

export {
  createWorkerMonitorLogMessage,
  createWorkerMonitorProgressMessage,
  isWorkerMonitorLogMessage,
  isWorkerMonitorProgressMessage,
} from './protocol';

/** Apply progress or log envelopes from a worker `postMessage`. */
export function applyWorkerMonitorMessage(
  workerId: string,
  data: unknown,
): boolean {
  if (isWorkerMonitorProgressMessage(data)) {
    const handle = WorkerMonitor.getHandle(workerId);
    if (handle) {
      handle.setProgress(data.taskId, {
        current: data.current,
        total: data.total,
        message: data.message,
      });
    }
    return true;
  }
  if (isWorkerMonitorLogMessage(data)) {
    const handle = WorkerMonitor.getHandle(workerId);
    if (handle) {
      handle.log({
        level: data.level,
        message: data.message,
        taskId: data.taskId,
      });
    }
    return true;
  }
  return false;
}
