<template>
  <div class="devtools-header">
    <div class="tabs">
      <MapControlButton
        :active="state.activeTab === 'store'"
        variant="text"
        size="small"
        @click="state.activeTab = 'store'"
      >
        Store
      </MapControlButton>
      <MapControlButton
        :active="state.activeTab === 'logs'"
        variant="text"
        size="small"
        @click="state.activeTab = 'logs'"
      >
        Logs ({{ logCount }})
      </MapControlButton>
      <MapControlButton
        :active="state.activeTab === 'errors'"
        variant="text"
        size="small"
        @click="state.activeTab = 'errors'"
      >
        Errors
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
    <StoreViewer v-if="state.activeTab === 'store'" />
    <LogViewer v-if="state.activeTab === 'logs'" />
    <ErrorViewer v-if="state.activeTab === 'errors'" />
  </div>
</template>

<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';
import { computed } from 'vue';
import { devtoolState } from '../store';
import ErrorViewer from './ErrorViewer.vue';
import LogViewer from './LogViewer.vue';
import StoreViewer from './StoreViewer.vue';

defineProps<{
  showClose?: boolean;
}>();

const emit = defineEmits<{ close: [] }>();

const state = devtoolState;
const logCount = computed(() => state.logs.length);
</script>

<style scoped>
.devtools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: color-mix(
    in srgb,
    var(--map-surface-variant-color, #f5f5f5) 88%,
    var(--map-surface-color, #fff)
  );
  border-bottom: 1px solid
    color-mix(in srgb, var(--map-divider-color, #ddd) 85%, transparent);
  flex-shrink: 0;
}

.tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.devtools-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
</style>
