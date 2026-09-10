<template>
  <div class="devtools-container">
    <button
      v-if="!state.isOpen"
      type="button"
      class="devtools-toggle"
      @click="open"
    >
      🛠️
    </button>

    <template v-if="state.isOpen && !isMobile">
      <div class="devtools-panel">
        <div class="devtools-header">
          <div class="tabs">
            <BaseButton
              :active="state.activeTab === 'store'"
              @click="state.activeTab = 'store'"
            >
              Store
            </BaseButton>
            <BaseButton
              :active="state.activeTab === 'logs'"
              @click="state.activeTab = 'logs'"
            >
              Logs
            </BaseButton>
            <BaseButton
              :active="state.activeTab === 'errors'"
              @click="state.activeTab = 'errors'"
            >
              Errors
            </BaseButton>
          </div>
          <BaseButton class="close-btn" @click="close">X</BaseButton>
        </div>
        <div class="devtools-content">
          <StoreViewer v-if="state.activeTab === 'store'" />
          <LogViewer v-if="state.activeTab === 'logs'" />
          <ErrorViewer v-if="state.activeTab === 'errors'" />
        </div>
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
        <div class="devtools-header">
          <div class="tabs">
            <BaseButton
              :active="state.activeTab === 'store'"
              @click="state.activeTab = 'store'"
            >
              Store
            </BaseButton>
            <BaseButton
              :active="state.activeTab === 'logs'"
              @click="state.activeTab = 'logs'"
            >
              Logs
            </BaseButton>
            <BaseButton
              :active="state.activeTab === 'errors'"
              @click="state.activeTab = 'errors'"
            >
              Errors
            </BaseButton>
          </div>
        </div>
        <div class="devtools-content">
          <StoreViewer v-if="state.activeTab === 'store'" />
          <LogViewer v-if="state.activeTab === 'logs'" />
          <ErrorViewer v-if="state.activeTab === 'errors'" />
        </div>
      </div>
    </DraggableItemBottom>

    <div
      v-else-if="state.isOpen && isMobile"
      class="devtools-panel devtools-panel--sheet"
    >
      <div class="devtools-header">
        <div class="tabs">
          <BaseButton
            :active="state.activeTab === 'store'"
            @click="state.activeTab = 'store'"
          >
            Store
          </BaseButton>
          <BaseButton
            :active="state.activeTab === 'logs'"
            @click="state.activeTab = 'logs'"
          >
            Logs
          </BaseButton>
          <BaseButton
            :active="state.activeTab === 'errors'"
            @click="state.activeTab = 'errors'"
          >
            Errors
          </BaseButton>
        </div>
        <BaseButton class="close-btn" @click="close">X</BaseButton>
      </div>
      <div class="devtools-content">
        <StoreViewer v-if="state.activeTab === 'store'" />
        <LogViewer v-if="state.activeTab === 'logs'" />
        <ErrorViewer v-if="state.activeTab === 'errors'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BaseButton } from '@hungpvq/vue-map-core';
import { DraggableItemBottom } from '@hungpvq/vue-draggable';
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { devtoolState, toggleDevtoolOpen } from '../store';
import ErrorViewer from './ErrorViewer.vue';
import LogViewer from './LogViewer.vue';
import {
  isDevtoolsMobileViewport,
  resolveMapDragContainerId,
} from './resolve-map-drag-container';
import StoreViewer from './StoreViewer.vue';

const props = defineProps<{
  /** Map `DraggableContainer` id. Auto-resolves `map-draggable-*` when omitted. */
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
  if (!state.isOpen) toggleDevtoolOpen();
}

function close() {
  if (state.isOpen) toggleDevtoolOpen();
}

function onBottomShow(value: boolean) {
  if (value) refreshContainerId();
  if (state.isOpen !== value) toggleDevtoolOpen();
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
  font-family: sans-serif;
}

.devtools-toggle {
  background-color: var(--map-button-bg, var(--map-surface-color, #ffffff));
  color: var(--map-card-text, var(--map-text-primary, #333));
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  font-size: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.devtools-panel {
  position: fixed;
  bottom: 45px;
  right: 50px;
  width: 600px;
  height: 400px;
  background-color: var(--map-surface-color, #ffffff);
  border: 1px solid var(--map-border-color, #ccc);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
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

.devtools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background-color: var(--map-surface-variant-color, #f5f5f5);
  border-bottom: 1px solid var(--map-divider-color, #ddd);
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
