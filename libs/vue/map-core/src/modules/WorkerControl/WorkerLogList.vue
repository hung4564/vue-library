<script setup lang="ts">
import {
  formatWorkerLogTime,
  type WorkerLogEntry,
} from '@hungpvq/map-core';
import { computed, onBeforeUpdate, onUpdated, ref } from 'vue';

const props = defineProps<{
  logs: WorkerLogEntry[];
  compact?: boolean;
}>();

const root = ref<HTMLElement | null>(null);
let savedScrollTop = 0;
let savedScrollHeight = 0;
let stickToLatest = true;

const memoKey = computed(() => {
  const logs = props.logs;
  if (!logs.length) return '0';
  // Newest is index 0 — include it so live appends invalidate v-memo.
  return `${logs.length}:${logs[0].id}:${logs[logs.length - 1].id}`;
});

// Newest-on-top: stay pinned to top while following; otherwise keep the same lines in view.
onBeforeUpdate(() => {
  const el = root.value;
  savedScrollTop = el?.scrollTop ?? 0;
  savedScrollHeight = el?.scrollHeight ?? 0;
  stickToLatest = savedScrollTop <= 8;
});

onUpdated(() => {
  const el = root.value;
  if (!el) return;
  if (stickToLatest) {
    el.scrollTop = 0;
    return;
  }
  const delta = el.scrollHeight - savedScrollHeight;
  el.scrollTop = savedScrollTop + Math.max(0, delta);
});
</script>

<template>
  <div
    ref="root"
    class="map-worker-control__log-list"
    :class="{ 'is-compact': compact }"
    v-memo="[memoKey, compact]"
  >
    <div
      v-for="entry in logs"
      :key="entry.id"
      class="map-worker-control__log"
      :data-level="entry.level"
    >
      <span class="map-worker-control__log-time">{{
        formatWorkerLogTime(entry.at)
      }}</span>
      <span class="map-worker-control__log-level">{{ entry.level }}</span>
      <span class="map-worker-control__log-message">{{ entry.message }}</span>
    </div>
  </div>
</template>
