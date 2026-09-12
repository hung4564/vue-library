<template>
  <div class="devtools-container">
    <MapControlButton
      v-if="!state.isOpen"
      class="devtools-toggle"
      variant="icon"
      :size="48"
      title="Map Devtools"
      aria-label="Map Devtools"
      @click="open"
    >
      <SvgIcon :size="22" type="mdi" :path="mdiTools" />
    </MapControlButton>

    <template v-if="state.isOpen && !isMobile">
      <div class="devtools-panel">
        <DevtoolsPanelBody show-close @close="close" />
      </div>
    </template>

    <DraggableItemBottom
      v-if="state.isOpen && isMobile && resolvedContainerId"
      :id="bottomItemId"
      :show="state.isOpen"
      :container-id="resolvedContainerId"
      title="Map Devtools"
      @update:show="onBottomShow"
    >
      <div class="devtools-bottom-body">
        <DevtoolsPanelBody />
      </div>
    </DraggableItemBottom>

    <div
      v-else-if="state.isOpen && isMobile"
      class="devtools-panel devtools-panel--sheet"
    >
      <DevtoolsPanelBody show-close @close="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';
import { DraggableItemBottom } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiTools } from '@mdi/js';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { setDevtoolOpen } from '../store';
import { devtoolState } from '../store';
import DevtoolsPanelBody from './DevtoolsPanelBody.vue';
import {
  isDevtoolsMobileViewport,
  resolveMapDragContainerId,
} from './resolve-map-drag-container';

const props = defineProps<{
  containerId?: string;
}>();

const state = devtoolState;
const isMobile = ref(isDevtoolsMobileViewport());
const resolvedContainerId = ref<string | null>(null);
const bottomItemId = 'map-devtools-bottom';

function refreshContainerId() {
  resolvedContainerId.value = resolveMapDragContainerId(props.containerId);
}

function refreshMobile() {
  isMobile.value = isDevtoolsMobileViewport();
}

function open() {
  refreshContainerId();
  setDevtoolOpen(true);
}

function close() {
  setDevtoolOpen(false);
}

function onBottomShow(value: boolean) {
  if (value) refreshContainerId();
  setDevtoolOpen(value);
}

watch(
  () => props.containerId,
  () => {
    if (state.isOpen) refreshContainerId();
  },
);

watch(
  () => state.isOpen,
  (openNow) => {
    if (openNow) refreshContainerId();
  },
);

onMounted(() => {
  refreshMobile();
  refreshContainerId();
  window.addEventListener('resize', refreshMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', refreshMobile);
});
</script>

<style scoped>
.devtools-container {
  position: fixed;
  bottom: 45px;
  right: 50px;
  z-index: 9999;
  font-family: var(--map-font-family, system-ui, sans-serif);
}

.devtools-container :deep(.devtools-toggle) {
  --map-button-bg: var(--map-surface-color, #ffffff);
  color: var(--map-primary-color, #004e98);
  border: 1px solid
    color-mix(in srgb, var(--map-border-color, #ccc) 70%, transparent);
  box-shadow:
    0 2px 6px rgba(15, 23, 42, 0.08),
    0 8px 20px rgba(15, 23, 42, 0.1);
  transition:
    transform 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.18s ease,
    background-color 0.18s ease;
}

.devtools-container :deep(.devtools-toggle:hover:not(:disabled)) {
  color: var(--map-on-primary-color, #fff);
  background-color: var(--map-primary-color, #004e98);
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.12),
    0 12px 28px rgba(0, 78, 152, 0.28);
}

.devtools-container :deep(.devtools-toggle:active:not(:disabled)) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.14);
}

.devtools-panel {
  position: fixed;
  bottom: 45px;
  right: 50px;
  width: min(600px, calc(100vw - 32px));
  height: min(400px, calc(100vh - 96px));
  background-color: var(--map-surface-color, #ffffff);
  border: 1px solid
    color-mix(in srgb, var(--map-border-color, #ccc) 80%, transparent);
  border-radius: 12px;
  box-shadow:
    0 8px 24px rgba(15, 23, 42, 0.12),
    0 2px 6px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--map-text-primary, #333);
}

.devtools-panel--sheet {
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 85vh;
  max-height: 85vh;
  border-radius: 12px 12px 0 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.devtools-bottom-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

@media (max-width: 640px) {
  .devtools-container {
    bottom: calc(16px + env(safe-area-inset-bottom, 0px));
    right: calc(16px + env(safe-area-inset-right, 0px));
  }
}
</style>
