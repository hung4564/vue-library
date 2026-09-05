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

const memoKey = computed(() => {
  const logs = props.logs;
  if (!logs.length) return '0';
  return `${logs.length}:${logs[0].id}:${logs[logs.length - 1].id}`;
});

// Parent re-renders often (progress / elapsed). Keep the user's scroll position.
onBeforeUpdate(() => {
  savedScrollTop = root.value?.scrollTop ?? 0;
});

onUpdated(() => {
  const el = root.value;
  if (el) el.scrollTop = savedScrollTop;
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
