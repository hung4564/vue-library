<template>
  <div class="store-viewer">
    <div class="store-viewer__toolbar">
      <MapControlButton
        variant="text"
        size="small"
        title="Refresh store snapshot"
        :disabled="refreshPhase === 'loading'"
        @click="onRefresh"
      >
        {{ refreshLabel }}
      </MapControlButton>
    </div>
    <div class="store-viewer__body">
      <TreeItem :data="storeState" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  createActionFeedback,
  type ActionFeedbackPhase,
} from '@hungpvq/map-core';
import {
  listMapIds,
  snapshotGlobalStore,
  snapshotMapScopedStore,
} from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/vue-map-core';
import {
  computed,
  onBeforeUnmount,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { useDevtoolState } from '../store';
import TreeItem from './TreeItem.vue';

const ALL = 'all';

const { filterMapId } = useDevtoolState();
const storeState = shallowRef<Record<string, unknown>>({});
const refreshPhase = ref<ActionFeedbackPhase>('idle');

const refreshFeedback = createActionFeedback({
  onChange: (phase) => {
    refreshPhase.value = phase;
  },
});

onBeforeUnmount(() => refreshFeedback.dispose());

const refreshLabel = computed(() => {
  if (refreshPhase.value === 'loading') return '…';
  if (refreshPhase.value === 'success') return 'Refreshed';
  if (refreshPhase.value === 'error') return 'Failed';
  return 'Refresh';
});

function dump(mapId: string): Record<string, unknown> {
  return mapId === ALL
    ? snapshotGlobalStore()
    : snapshotMapScopedStore(mapId);
}

function refreshQuiet() {
  const ids = listMapIds();
  const selected =
    filterMapId.value !== ALL && ids.includes(filterMapId.value)
      ? filterMapId.value
      : ALL;
  storeState.value = dump(selected);
}

async function onRefresh() {
  await refreshFeedback.run('refresh', () => {
    refreshQuiet();
  });
}

watch(filterMapId, () => {
  refreshQuiet();
});

let pollTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  refreshQuiet();
  pollTimer = setInterval(refreshQuiet, 1000);
});

onUnmounted(() => {
  if (pollTimer != null) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
});
</script>
