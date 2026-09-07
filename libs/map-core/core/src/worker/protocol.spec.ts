import { describe, expect, it } from 'vitest';
import {
  createWorkerMonitorLogMessage,
  createWorkerMonitorProgressMessage,
  isWorkerMonitorLogMessage,
  isWorkerMonitorProgressMessage,
} from './protocol';

describe('worker protocol', () => {
  it('guards and creates progress/log messages', () => {
    const progress = createWorkerMonitorProgressMessage('t1', 2, 10, 'half');
    expect(isWorkerMonitorProgressMessage(progress)).toBe(true);
    expect(isWorkerMonitorProgressMessage({ kind: 'progress' })).toBe(false);

    const log = createWorkerMonitorLogMessage('hello', {
      level: 'warn',
      taskId: 't1',
    });
    expect(isWorkerMonitorLogMessage(log)).toBe(true);
    expect(log.level).toBe('warn');
    expect(isWorkerMonitorLogMessage(null)).toBe(false);
  });
});
