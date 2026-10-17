<template>
  <div class="devtools-header">
    <MapTabs
      class="devtools-tabs-host"
      :model-value="state.activeTab"
      :items="tabItems"
      :with-panes="false"
      @update:model-value="onTabChange"
    />
    <MapControlButton
      v-if="showClose"
      class="close-btn"
      variant="text"
      size="small"
      @click="emit('close')"
    >
      X
    </MapControlButton>
  </div>
  <div class="devtools-content">
    <div
      class="devtools-content__pane"
      :hidden="state.activeTab !== 'store'"
    >
      <StoreViewer />
    </div>
    <!-- Keep mounted: Run/menu actions can remount the panel; local UI must survive. -->
    <div
      class="devtools-content__pane"
      :hidden="state.activeTab !== 'dataset'"
    >
      <DatasetMenuViewer />
    </div>
    <div
      class="devtools-content__pane"
      :hidden="state.activeTab !== 'logs'"
    >
      <LogViewer />
    </div>
    <div
      class="devtools-content__pane"
      :hidden="state.activeTab !== 'errors'"
    >
      <ErrorViewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  MapControlButton,
  type MapTabItem,
  MapTabs,
} from '@hungpvq/vue-map-core';
import { computed } from 'vue';

import { setDevtoolActiveTab } from '@hungpvq/map-debug';
import { defineEmits, defineProps, withDefaults } from 'vue';
import { type DevtoolTab, getDevtoolState } from '../store';
import DatasetMenuViewer from './DatasetMenuViewer.vue';
import ErrorViewer from './ErrorViewer.vue';
import LogViewer from './LogViewer.vue';
import StoreViewer from './StoreViewer.vue';

withDefaults(
  defineProps<{
    showClose?: boolean;
    /** When false, hide the map filter strip in the panel header. */
  }>(),
  {
    showClose: false,
  },
);

const emit = defineEmits<{ close: [] }>();

const state = getDevtoolState();
const logCount = computed(() => state.logs.length);
const errorCount = computed(() => state.errors.length);

const tabItems = computed((): MapTabItem[] => {
  const tabs: MapTabItem[] = [
    { id: 'store', label: 'Store', order: 1 },
    { id: 'logs', label: `Logs (${logCount.value})`, order: 99 },
    { id: 'errors', label: `Errors (${errorCount.value})`, order: 99 },
  ];
  if (state.installedDataset) {
    tabs.push({ id: 'dataset', label: 'Dataset', order: 2 });
  }
  return tabs.sort((a, b) => (a.order || 0) - (b.order || 0));
});

function onTabChange(id: string) {
  setDevtoolActiveTab(id as DevtoolTab);
}
</script>
