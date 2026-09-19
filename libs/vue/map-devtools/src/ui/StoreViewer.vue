<template>
  <div class="store-viewer">
    <div class="store-viewer__toolbar">
      <MapControlButton variant="text" size="small" @click="refresh">
        Refresh
      </MapControlButton>
    </div>
    <div class="store-viewer__body">
      <TreeItem :data="storeState" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  listMapIds,
  snapshotGlobalStore,
  snapshotMapScopedStore,
} from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/vue-map-core';
import { onMounted, onUnmounted, shallowRef, watch } from 'vue';
import { useDevtoolState } from '../store';
import TreeItem from './TreeItem.vue';

const ALL = 'all';

const { filterMapId } = useDevtoolState();
const storeState = shallowRef<Record<string, unknown>>({});

function dump(mapId: string): Record<string, unknown> {
  return mapId === ALL
    ? snapshotGlobalStore()
    : snapshotMapScopedStore(mapId);
}

const refresh = () => {
  const ids = listMapIds();
  const selected =
    filterMapId.value !== ALL && ids.includes(filterMapId.value)
      ? filterMapId.value
      : ALL;
  storeState.value = dump(selected);
};

watch(filterMapId, () => {
  refresh();
});

let pollTimer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  refresh();
  pollTimer = setInterval(refresh, 1000);
});

onUnmounted(() => {
  if (pollTimer != null) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
});
</script>
