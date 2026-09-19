<script setup lang="ts">
import { DEMO_DATASET_SOURCE_VIEWER_KEY } from '@hungpvq/demo-map-datasets';
import { bootstrapMapTheme } from '@hungpvq/map-core/theme';
import { UniversalRegistry } from '@hungpvq/vue-map-core';
import { RouterView } from 'vue-router';
import DatasetSourceViewer from '../views/dataset-data-management/dataset-source-viewer.vue';

bootstrapMapTheme('auto');

UniversalRegistry.registerComponent(
  DEMO_DATASET_SOURCE_VIEWER_KEY,
  DatasetSourceViewer,
);
</script>

<template>
  <div class="app">
    <RouterView />
  </div>
</template>

<style scoped lang="css">
.app {
  width: 100%;
  height: 100%;
}
</style>
