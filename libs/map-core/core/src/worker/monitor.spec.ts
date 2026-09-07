import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkerMonitor } from './monitor';

describe('WorkerMonitor', () => {
  afterEach(() => {
    for (const w of WorkerMonitor.list()) {
      WorkerMonitor.unregister(w.id);
    }
  });

  it('registers tasks, progress, logs, and history snapshot', () => {
    const listener = vi.fn();
    const off = WorkerMonitor.subscribe(listener);
    const handle = WorkerMonitor.register('w1', { name: 'Parser' });
    expect(WorkerMonitor.get('w1')?.name).toBe('Parser');

    const taskId = handle.startTask({ type: 'parse', engine: 'worker' });
    handle.setProgress(taskId, { current: 1, total: 2, message: 'step' });
    handle.log({ level: 'info', message: 'working', taskId });
    handle.completeTask(taskId, { engine: 'worker' });

    const snap = WorkerMonitor.get('w1')!;
    expect(snap.history).toHaveLength(1);
    expect(snap.history[0].type).toBe('parse');
    expect(snap.stats.ok).toBe(1);
    expect(listener).toHaveBeenCalled();
    off();
  });
});
