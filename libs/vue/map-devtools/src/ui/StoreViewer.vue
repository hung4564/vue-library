<template>
  <div class="store-viewer">
    <div class="store-controls">
      <MapControlButton variant="text" size="small" @click="refresh">
        Refresh
      </MapControlButton>
    </div>
    <div class="json-tree">
      <TreeItem :data="storeState" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GlobalStoreService } from '@hungpvq/shared-store';
import { MapControlButton } from '@hungpvq/vue-map-core';

import { onMounted, onUnmounted, shallowRef } from 'vue';
import TreeItem from './TreeItem.vue';
// Use shallowRef to avoid deep reactivity overhead for the snapshot
const storeState = shallowRef({});

const refresh = () => {
  // Get a snapshot of the store
  storeState.value = { ...GlobalStoreService.getInstance().getState() };
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

<style scoped>
.store-viewer {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.store-controls {
  padding: 8px;
  border-bottom: 1px solid #ddd;
}
.json-tree {
  flex: 1;
  overflow: auto;
  padding: 8px;
}
</style>
