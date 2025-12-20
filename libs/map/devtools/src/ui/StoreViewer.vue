<template>
  <div class="store-viewer">
    <div class="store-controls">
      <BaseButton @click="refresh">Refresh</BaseButton>
    </div>
    <div class="json-tree">
      <TreeItem :data="storeState" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { GlobalStoreService } from '@hungpvq/shared-store';
import { BaseButton } from '@hungpvq/vue-map-core';
import { onMounted, shallowRef } from 'vue';
import TreeItem from './TreeItem.vue';
// Use shallowRef to avoid deep reactivity overhead for the snapshot
const storeState = shallowRef({});

const refresh = () => {
  // Get a snapshot of the store
  storeState.value = { ...GlobalStoreService.getInstance().getState() };
};

onMounted(() => {
  refresh();
  // Optional: Poll for changes
  setInterval(refresh, 1000);
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
