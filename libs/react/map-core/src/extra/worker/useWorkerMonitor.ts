import {
  WorkerMonitor,
  type WorkerSnapshot,
} from '@hungpvq/map-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useWorkerMonitor() {
  const [workers, setWorkers] = useState<WorkerSnapshot[]>(() =>
    WorkerMonitor.list(),
  );
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(() => {
    setWorkers(WorkerMonitor.list());
    setNow(Date.now());
  }, []);

  useEffect(() => {
    refresh();
    const stop = WorkerMonitor.subscribe(refresh);
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => {
      stop();
      clearInterval(timer);
    };
  }, [refresh]);

  const busy = useMemo(
    () =>
      workers.some(
        (worker) => worker.status === 'busy' || worker.pending.length > 0,
      ),
    [workers],
  );

  return {
    workers,
    now,
    busy,
    refresh,
    clearHistory: WorkerMonitor.clearHistory,
  };
}
