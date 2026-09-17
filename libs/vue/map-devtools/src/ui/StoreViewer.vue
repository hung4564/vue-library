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
import { snapshotGlobalStore } from '@hungpvq/map-debug';
import { MapControlButton } from '@hungpvq/vue-map-core';
import { onMounted, onUnmounted, shallowRef } from 'vue';
import TreeItem from './TreeItem.vue';

const storeState = shallowRef({});

const refresh = () => {
  storeState.value = snapshotGlobalStore();
};

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
