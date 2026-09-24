import {
  createWorkerUiDelayState,
  WorkerMonitor,
  type WorkerSnapshot,
} from '@hungpvq/map-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useWorkerMonitor() {
  const [rawWorkers, setRawWorkers] = useState<WorkerSnapshot[]>(() =>
    WorkerMonitor.list(),
  );
  const [now, setNow] = useState(() => Date.now());
  const delayRef = useRef(createWorkerUiDelayState());
  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  const clearDelayTimer = useCallback(() => {
    if (delayTimerRef.current != null) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = undefined;
    }
  }, []);

  const scheduleDelayTick = useCallback(
    (workers: WorkerSnapshot[], at: number) => {
      clearDelayTimer();
      const { nextAt } = delayRef.current.project(workers, at);
      if (nextAt == null) return;
      const wait = Math.max(0, nextAt - Date.now());
      delayTimerRef.current = setTimeout(() => {
        const list = WorkerMonitor.list();
        const nextNow = Date.now();
        setRawWorkers(list);
        setNow(nextNow);
        scheduleDelayTick(list, nextNow);
      }, wait);
    },
    [clearDelayTimer],
  );

  const refresh = useCallback(() => {
    const list = WorkerMonitor.list();
    const nextNow = Date.now();
    setRawWorkers(list);
    setNow(nextNow);
    scheduleDelayTick(list, nextNow);
  }, [scheduleDelayTick]);

  useEffect(() => {
    refresh();
    const stop = WorkerMonitor.subscribe(refresh);
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => {
      stop();
      clearInterval(timer);
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
