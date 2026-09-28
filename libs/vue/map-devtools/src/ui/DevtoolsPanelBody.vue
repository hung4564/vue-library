<template>
  <div class="devtools-header">
    <DevtoolsMapFilter v-if="showMapFilter" />
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

import { devtoolState, type DevtoolTab, setDevtoolActiveTab } from '../store';
import DatasetMenuViewer from './DatasetMenuViewer.vue';
import DevtoolsMapFilter from './DevtoolsMapFilter.vue';
import ErrorViewer from './ErrorViewer.vue';
import LogViewer from './LogViewer.vue';
import StoreViewer from './StoreViewer.vue';

withDefaults(
  defineProps<{
    showClose?: boolean;
    /** When false, hide the map filter strip in the panel header. */
    showMapFilter?: boolean;
  }>(),
  {
    showClose: false,
    showMapFilter: true,
  },
);

const emit = defineEmits<{ close: [] }>();

const state = devtoolState;
const logCount = computed(() => state.logs.length);
const errorCount = computed(() => state.errors.length);

const tabItems = computed((): MapTabItem[] => [
  { id: 'store', label: 'Store' },
  { id: 'dataset', label: 'Dataset' },
  { id: 'logs', label: `Logs (${logCount.value})` },
  { id: 'errors', label: `Errors (${errorCount.value})` },
]);

function onTabChange(id: string) {
  setDevtoolActiveTab(id as DevtoolTab);
}
</script>
