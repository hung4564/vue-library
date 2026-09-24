import { isWorkerBusy } from './format';
import type { WorkerRuntimeStatus, WorkerSnapshot } from './types';

/** Wait this long before WorkerControl shows busy / loading chrome. */
const BUSY_SHOW_DELAY_MS = 200;

/** Once busy chrome is shown, keep it at least this long (avoids hide flicker). */
const BUSY_MIN_VISIBLE_MS = 300;

type WorkerUiDelayTrack = {
  /** Last non-busy status for calm UI. */
  calmStatus: WorkerRuntimeStatus;
  /** When raw busy became true (earliest pending start). */
  busySince: number | null;
  /** When displayBusy flipped to true. */
  shownBusySince: number | null;
  displayBusy: boolean;
};

export type WorkerUiDelayProjectResult = {
  workers: WorkerSnapshot[];
  busy: boolean;
  /** Soonest time a delayed transition may need a re-project; `null` if idle. */
  nextAt: number | null;
};

function earliestBusySince(worker: WorkerSnapshot, now: number): number {
  let since = now;
  for (const task of worker.pending) {
    if (Number.isFinite(task.startedAt) && task.startedAt < since) {
      since = task.startedAt;
    }
  }
  return since;
}

function calmStatusOf(
  worker: WorkerSnapshot,
  previous: WorkerRuntimeStatus,
): WorkerRuntimeStatus {
  if (worker.status === 'busy') return previous;
  return worker.status;
}

function toDisplayWorker(
  worker: WorkerSnapshot,
  displayBusy: boolean,
  calmStatus: WorkerRuntimeStatus,
): WorkerSnapshot {
  if (!displayBusy) {
    return {
      ...worker,
      status: calmStatus,
      pending: [],
    };
  }
  if (isWorkerBusy(worker)) return worker;
  // Hold busy chrome after a quick finish until min-visible elapses.
  return {
    ...worker,
    status: 'busy',
    pending: [],
  };
}

/**
 * Stateful projector: suppress brief busy/loading flashes in WorkerControl.
 * Fast tasks that finish before the show delay never flip the UI; once shown,
 * busy stays for a short minimum so hide does not flicker.
 */
export function createWorkerUiDelayState() {
  const tracks = new Map<string, WorkerUiDelayTrack>();

  function project(
    workers: readonly WorkerSnapshot[],
    now = Date.now(),
  ): WorkerUiDelayProjectResult {
    const seen = new Set<string>();
    const out: WorkerSnapshot[] = [];
    let anyDisplayBusy = false;
    let nextAt: number | null = null;

    const consider = (at: number) => {
      if (at <= now) return;
      if (nextAt == null || at < nextAt) nextAt = at;
    };

    for (const worker of workers) {
      seen.add(worker.id);
      let track = tracks.get(worker.id);
      if (!track) {
        track = {
          calmStatus: worker.status === 'busy' ? 'idle' : worker.status,
          busySince: null,
          shownBusySince: null,
          displayBusy: false,
        };
        tracks.set(worker.id, track);
      }

      const rawBusy = isWorkerBusy(worker);
      track.calmStatus = calmStatusOf(worker, track.calmStatus);

      if (rawBusy) {
        if (track.busySince == null) {
          track.busySince = earliestBusySince(worker, now);
        }
        const showAt = track.busySince + BUSY_SHOW_DELAY_MS;
        if (!track.displayBusy) {
          if (now >= showAt) {
            track.displayBusy = true;
            track.shownBusySince = now;
          } else {
            consider(showAt);
          }
        }
      } else {
        track.busySince = null;
        if (track.displayBusy) {
          const shownAt = track.shownBusySince ?? now;
          const hideAt = shownAt + BUSY_MIN_VISIBLE_MS;
          if (now >= hideAt) {
            track.displayBusy = false;
            track.shownBusySince = null;
          } else {
            consider(hideAt);
          }
        }
      }

      if (track.displayBusy) anyDisplayBusy = true;
      out.push(toDisplayWorker(worker, track.displayBusy, track.calmStatus));
    }

    for (const id of [...tracks.keys()]) {
      if (!seen.has(id)) tracks.delete(id);
    }

    return { workers: out, busy: anyDisplayBusy, nextAt };
  }

  return { project };
}
