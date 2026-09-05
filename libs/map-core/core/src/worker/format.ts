import type {
  WorkerLogEntry,
  WorkerProgress,
  WorkerSnapshot,
} from './types';

export function formatWorkerDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '0ms';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 10_000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 1000)}s`;
}

export function formatWorkerLogTime(at: number): string {
  const date = new Date(at);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${ms}`;
}

export function workerProgressRatio(progress?: WorkerProgress): number | null {
  if (!progress) return null;
  if (progress.total != null && progress.total > 0) {
    return Math.min(1, Math.max(0, progress.current / progress.total));
  }
  if (progress.current >= 0 && progress.current <= 1) {
    return progress.current;
  }
  return null;
}

export function isWorkerBusy(worker: WorkerSnapshot): boolean {
  return worker.status === 'busy' || worker.pending.length > 0;
}

function sortWorkerSnapshots(
  workers: readonly WorkerSnapshot[],
): WorkerSnapshot[] {
  // Stable order — do not re-rank by busy on every progress tick (UI "restarts").
  return [...workers].sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}

export function filterWorkerSnapshots(
  workers: readonly WorkerSnapshot[],
  query: string,
): WorkerSnapshot[] {
  const sorted = sortWorkerSnapshots(workers);
  const q = query.trim().toLowerCase();
  if (!q) return sorted;
  return sorted.filter((worker) => {
    if (worker.id.toLowerCase().includes(q)) return true;
    if (worker.name.toLowerCase().includes(q)) return true;
    if (worker.status.toLowerCase().includes(q)) return true;
    return worker.pending.some((task) => task.type.toLowerCase().includes(q));
  });
}

/**
 * Keep an explicit selection sticky. Only when `selectedId` is empty or no
 * longer in the list, fall back to a busy worker (else first).
 */
export function resolveSelectedWorkerId(
  workers: readonly WorkerSnapshot[],
  selectedId: string,
): string {
  if (selectedId && workers.some((worker) => worker.id === selectedId)) {
    return selectedId;
  }
  const busy = workers.find(isWorkerBusy);
  return busy?.id ?? workers[0]?.id ?? '';
}

/**
 * Storage is newest-first. Return chronological order (oldest → newest).
 * When `limit` is set, only the newest `limit` entries are kept.
 * Omit `limit` to show the full buffer (committed worker log).
 */
export function workerLogsForDisplay(
  logs: readonly WorkerLogEntry[],
  limit?: number,
): WorkerLogEntry[] {
  const newestFirst =
    limit == null || limit >= logs.length ? logs : logs.slice(0, limit);
  return newestFirst.slice().reverse();
}
