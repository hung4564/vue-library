import { afterEach, describe, expect, it } from 'vitest';
import { WorkerMonitor } from './monitor';
import { runMonitoredTask } from './run-task';

describe('runMonitoredTask', () => {
  afterEach(() => {
    for (const w of WorkerMonitor.list()) {
      WorkerMonitor.unregister(w.id);
    }
  });

  it('completes primary engine path', async () => {
    const result = await runMonitoredTask('rt-1', 'demo', {
      engine: 'worker',
      run: async () => 42,
    });
    expect(result).toBe(42);
    expect(WorkerMonitor.get('rt-1')?.stats.ok).toBe(1);
  });

  it('falls back when primary fails', async () => {
    const result = await runMonitoredTask(
      'rt-2',
      'demo',
      {
        engine: 'worker',
        run: async () => {
          throw new Error('worker down');
        },
      },
      {
        engine: 'main',
        run: async () => 'fallback-ok',
      },
    );
    expect(result).toBe('fallback-ok');
    const snap = WorkerMonitor.get('rt-2')!;
    expect(snap.stats.fallback).toBeGreaterThanOrEqual(1);
    expect(snap.history.some((t) => t.status === 'ok')).toBe(true);
  });
});
