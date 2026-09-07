import { describe, expect, it } from 'vitest';
import {
  filterWorkerSnapshots,
  formatWorkerDuration,
  formatWorkerLogTime,
  isWorkerBusy,
  resolveSelectedWorkerId,
  workerLogsForDisplay,
  workerProgressRatio,
} from './format';

describe('worker format', () => {
  it('formats duration and log time', () => {
    expect(formatWorkerDuration(12)).toBe('12ms');
    expect(formatWorkerDuration(1500)).toBe('1.5s');
    expect(formatWorkerDuration(12_000)).toBe('12s');
    expect(formatWorkerLogTime(new Date('2020-01-01T12:34:56.789Z').getTime())).toMatch(
      /\d{2}:\d{2}:\d{2}\.\d{3}/,
    );
  });

  it('computes progress ratio and busy state', () => {
    expect(workerProgressRatio({ current: 2, total: 4 })).toBe(0.5);
    expect(workerProgressRatio({ current: 0.25 })).toBe(0.25);
    expect(workerProgressRatio()).toBeNull();
    expect(isWorkerBusy({ status: 'busy', pending: [] } as any)).toBe(true);
    expect(
      isWorkerBusy({ status: 'idle', pending: [{ id: '1' }] } as any),
    ).toBe(true);
  });

  it('filters / selects workers and reverses logs for display', () => {
    const workers = [
      { id: 'b', name: 'Beta', status: 'idle', pending: [] },
      { id: 'a', name: 'Alpha', status: 'busy', pending: [{ type: 'parse' }] },
    ] as any;
    expect(filterWorkerSnapshots(workers, 'alp').map((w) => w.id)).toEqual([
      'a',
    ]);
    expect(resolveSelectedWorkerId(workers, 'b')).toBe('b');
    expect(resolveSelectedWorkerId(workers, '')).toBe('a');
    expect(
      workerLogsForDisplay(
        [
          { message: 'new', at: 2 },
          { message: 'old', at: 1 },
        ] as any,
      ).map((l) => l.message),
    ).toEqual(['old', 'new']);
  });
});
