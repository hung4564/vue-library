import { describe, expect, it } from 'vitest';

import type { WorkerSnapshot } from './types';
import { createWorkerUiDelayState } from './ui-delay';

const SHOW_MS = 200;
const MIN_VISIBLE_MS = 300;

function snap(
  partial: Partial<WorkerSnapshot> & Pick<WorkerSnapshot, 'id'>,
): WorkerSnapshot {
  return {
    name: partial.name ?? partial.id,
    status: partial.status ?? 'idle',
    pending: partial.pending ?? [],
    history: partial.history ?? [],
    logs: partial.logs ?? [],
    stats: partial.stats ?? { ok: 0, error: 0, fallback: 0 },
    ...partial,
  };
}

describe('createWorkerUiDelayState', () => {
  it('does not show busy before show delay (fast task never flickers)', () => {
    const delay = createWorkerUiDelayState();
    const t0 = 1_000_000;
    const busy = snap({
      id: 'geojson',
      status: 'busy',
      pending: [
        {
          id: '1',
          type: 'parse',
          status: 'running',
          engine: 'worker',
          startedAt: t0,
        },
      ],
    });

    const early = delay.project([busy], t0 + 50);
    expect(early.busy).toBe(false);
    expect(early.workers[0]?.status).toBe('idle');
    expect(early.workers[0]?.pending).toEqual([]);
    expect(early.nextAt).toBe(t0 + SHOW_MS);

    // Finished before show delay
    const done = snap({ id: 'geojson', status: 'idle', pending: [] });
    const after = delay.project([done], t0 + 80);
    expect(after.busy).toBe(false);
    expect(after.workers[0]?.status).toBe('idle');
    expect(after.nextAt).toBeNull();
  });

  it('shows busy after delay and keeps it for min visible time', () => {
    const delay = createWorkerUiDelayState();
    const t0 = 2_000_000;
    const busy = snap({
      id: 'sample',
      status: 'not-started',
      pending: [
        {
          id: '1',
          type: 'sum',
          status: 'running',
          engine: 'worker',
          startedAt: t0,
        },
      ],
    });
    // First tick arms busySince from pending
    delay.project(
      [
        snap({
          id: 'sample',
          status: 'busy',
          pending: busy.pending,
        }),
      ],
      t0,
    );

    const shown = delay.project(
      [
        snap({
          id: 'sample',
          status: 'busy',
          pending: busy.pending,
        }),
      ],
      t0 + SHOW_MS,
    );
    expect(shown.busy).toBe(true);
    expect(shown.workers[0]?.status).toBe('busy');
    expect(shown.workers[0]?.pending).toHaveLength(1);

    const justFinished = delay.project(
      [snap({ id: 'sample', status: 'idle', pending: [] })],
      t0 + SHOW_MS + 10,
    );
    expect(justFinished.busy).toBe(true);
    expect(justFinished.workers[0]?.status).toBe('busy');
    expect(justFinished.workers[0]?.pending).toEqual([]);
    expect(justFinished.nextAt).toBe(t0 + SHOW_MS + MIN_VISIBLE_MS);

    const settled = delay.project(
      [snap({ id: 'sample', status: 'idle', pending: [] })],
      t0 + SHOW_MS + MIN_VISIBLE_MS,
    );
    expect(settled.busy).toBe(false);
    expect(settled.nextAt).toBeNull();
  });

  it('preserves not-started calm status during suppressed busy', () => {
    const delay = createWorkerUiDelayState();
    const t0 = 3_000_000;
    delay.project(
      [snap({ id: 'vectortile', status: 'not-started', pending: [] })],
      t0,
    );
    const mid = delay.project(
      [
        snap({
          id: 'vectortile',
          status: 'busy',
          pending: [
            {
              id: 't',
              type: 'open',
              status: 'running',
              engine: 'worker',
              startedAt: t0,
            },
          ],
        }),
      ],
      t0 + 20,
    );
    expect(mid.workers[0]?.status).toBe('not-started');
  });
});
