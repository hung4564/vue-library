import {
  WorkerMonitor,
  createWorkerUiDelayState,
  type WorkerSnapshot,
} from '@hungpvq/map-core';
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';

export function useWorkerMonitor() {
  const rawWorkers = shallowRef<WorkerSnapshot[]>(WorkerMonitor.list());
  const now = ref(Date.now());
  const delay = createWorkerUiDelayState();
  let stop: (() => void) | undefined;
  let tickTimer: ReturnType<typeof setInterval> | undefined;
  let delayTimer: ReturnType<typeof setTimeout> | undefined;

  const projected = computed(() =>
    delay.project(rawWorkers.value, now.value),
  );

  const workers = computed(() => projected.value.workers);
  const busy = computed(() => projected.value.busy);

  function clearDelayTimer() {
    if (delayTimer != null) {
      clearTimeout(delayTimer);
      delayTimer = undefined;
    }
  }

  function scheduleDelayTick(nextAt: number | null) {
    clearDelayTimer();
    if (nextAt == null) return;
    const wait = Math.max(0, nextAt - Date.now());
    delayTimer = setTimeout(() => {
      now.value = Date.now();
      scheduleDelayTick(delay.project(rawWorkers.value, now.value).nextAt);
    }, wait);
  }

  function refresh() {
    rawWorkers.value = WorkerMonitor.list();
    now.value = Date.now();
    scheduleDelayTick(delay.project(rawWorkers.value, now.value).nextAt);
  }

  onMounted(() => {
    refresh();
    stop = WorkerMonitor.subscribe(refresh);
    tickTimer = setInterval(() => {
      now.value = Date.now();
    }, 250);
  });

  onUnmounted(() => {
    stop?.();
    if (tickTimer) clearInterval(tickTimer);
    clearDelayTimer();
  });

  return {
    workers,
    now,
    busy,
    refresh,
    clearHistory: (id?: string) => WorkerMonitor.clearHistory(id),
  };
}
