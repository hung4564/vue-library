<script setup lang="ts">
import { DEMO_DATASET_SOURCE_VIEWER_KEY } from '@hungpvq/demo-map-datasets';
import { bootstrapMapTheme } from '@hungpvq/map-core/theme';
import { UniversalRegistry } from '@hungpvq/vue-map-core';
import { Devtools } from '@hungpvq/vue-map-devtools';
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
    <Devtools />
  </div>
</template>

<style scoped lang="css">
.app {
  width: 100%;
  height: 100%;
}
header {
  line-height: 1.5;
  max-width: 100vw;
}

nav > a {
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 768px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
    margin-left: auto;
    margin-right: auto;
    max-width: 768px;
  }

  nav {
    text-align: left;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
