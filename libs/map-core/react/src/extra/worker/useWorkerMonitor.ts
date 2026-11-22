import {
  createWorkerUiDelayState,
  WorkerMonitor,
  type WorkerSnapshot,
} from '@hungpvq/map-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function areWorkersEqual(a: WorkerSnapshot[], b: WorkerSnapshot[]): boolean {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  return a.every((worker, index) => {
    const other = b[index];

    // So sánh snapshot; bổ sung các field UI thực sự sử dụng.
    return worker.id === other.id && worker.status === other.status;
  });
}

export function useWorkerMonitor() {
  const [rawWorkers, setRawWorkers] = useState<WorkerSnapshot[]>(() =>
    WorkerMonitor.list(),
  );

  const [now, setNow] = useState(() => Date.now());

  const delayRef = useRef(createWorkerUiDelayState());
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  const clearDelayTimer = useCallback(() => {
    if (delayTimerRef.current !== undefined) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = undefined;
    }
  }, []);

  const scheduleDelayTick = useCallback(
    (workers: WorkerSnapshot[], at: number) => {
      clearDelayTimer();

      const { nextAt } = delayRef.current.project(workers, at);

      if (nextAt == null || !Number.isFinite(nextAt)) {
        return;
      }

      const wait = Math.max(0, nextAt - Date.now());

      delayTimerRef.current = setTimeout(() => {
        delayTimerRef.current = undefined;

        const nextWorkers = WorkerMonitor.list();
        const nextNow = Date.now();

        setRawWorkers((previous) =>
          areWorkersEqual(previous, nextWorkers) ? previous : nextWorkers,
        );

        setNow(nextNow);
        scheduleDelayTick(nextWorkers, nextNow);
      }, wait);
    },
    [clearDelayTimer],
  );

  const refresh = useCallback(() => {
    const list = WorkerMonitor.list();
    const nextNow = Date.now();

    setRawWorkers((previous) =>
      areWorkersEqual(previous, list) ? previous : list,
    );

    setNow(nextNow);
    scheduleDelayTick(list, nextNow);
  }, [scheduleDelayTick]);

  useEffect(() => {
    refresh();

    const stop = WorkerMonitor.subscribe(refresh);

    return () => {
      stop();
      clearDelayTimer();
    };
  }, [refresh, clearDelayTimer]);

  const projected = useMemo(
    () => delayRef.current.project(rawWorkers, now),
    [rawWorkers, now],
  );

  return {
    workers: projected.workers,
    now,
    busy: projected.busy,
    refresh,
    clearHistory: WorkerMonitor.clearHistory,
  };
}
