<template>
  <div class="devtools-header">
    <DevtoolsMapFilter v-if="showMapFilter" />
    <div class="devtools-tabs">
      <MapControlButton
        :active="state.activeTab === 'store'"
        variant="text"
        size="small"
        @click="setDevtoolActiveTab('store')"
      >
        Store
      </MapControlButton>
      <MapControlButton
        :active="state.activeTab === 'dataset'"
        variant="text"
        size="small"
        @click="setDevtoolActiveTab('dataset')"
      >
        Dataset
      </MapControlButton>
      <MapControlButton
        :active="state.activeTab === 'logs'"
        variant="text"
        size="small"
        @click="setDevtoolActiveTab('logs')"
      >
        Logs ({{ logCount }})
      </MapControlButton>
      <MapControlButton
        :active="state.activeTab === 'errors'"
        variant="text"
        size="small"
        @click="setDevtoolActiveTab('errors')"
      >
        Errors ({{ errorCount }})
      </MapControlButton>
    </div>
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
    <div class="devtools-content__pane" :hidden="state.activeTab !== 'store'">
      <StoreViewer />
    </div>
    <!-- Keep mounted: Run/menu actions can remount the panel; local UI must survive. -->
    <div class="devtools-content__pane" :hidden="state.activeTab !== 'dataset'">
      <DatasetMenuViewer />
    </div>
    <div class="devtools-content__pane" :hidden="state.activeTab !== 'logs'">
      <LogViewer />
    </div>
    <div class="devtools-content__pane" :hidden="state.activeTab !== 'errors'">
      <ErrorViewer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';
import { computed } from 'vue';

import { devtoolState, setDevtoolActiveTab } from '../store';
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
</script>
