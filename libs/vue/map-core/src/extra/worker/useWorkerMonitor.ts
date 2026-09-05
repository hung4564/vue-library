import {
  WorkerMonitor,
  type WorkerSnapshot,
} from '@hungpvq/map-core';
import { computed, onMounted, onUnmounted, ref, shallowRef } from 'vue';

export function useWorkerMonitor() {
  const workers = shallowRef<WorkerSnapshot[]>(WorkerMonitor.list());
  const now = ref(Date.now());
  let stop: (() => void) | undefined;
  let timer: ReturnType<typeof setInterval> | undefined;

  function refresh() {
    workers.value = WorkerMonitor.list();
    now.value = Date.now();
  }

  onMounted(() => {
    refresh();
    stop = WorkerMonitor.subscribe(refresh);
    timer = setInterval(() => {
      now.value = Date.now();
    }, 250);
  });

  onUnmounted(() => {
    stop?.();
    if (timer) clearInterval(timer);
  });

  const busy = computed(() =>
    workers.value.some(
      (worker) => worker.status === 'busy' || worker.pending.length > 0,
    ),
  );

  return {
    workers,
    now,
    busy,
    refresh,
    clearHistory: (id?: string) => WorkerMonitor.clearHistory(id),
  };
}
