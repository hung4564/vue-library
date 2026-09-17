<template>
  <div
    ref="shellRef"
    class="devtools-container"
    :class="{
      'devtools-container--mobile': isMobile,
      'devtools-container--open': state.isOpen,
      'devtools-container--dragging': dragging,
      'devtools-container--moved': !!pos,
    }"
    :style="shellStyle"
  >
    <MapControlButton
      v-if="!state.isOpen"
      class="devtools-toggle"
      variant="icon"
      :size="48"
      title="Map Devtools — drag to move"
      aria-label="Map Devtools"
      @pointerdown="onShellPointerDown"
      @click="onToggleClick"
    >
      <SvgIcon :size="22" type="mdi" :path="mdiTools" />
    </MapControlButton>

    <div
      v-else
      class="devtools-panel"
      :class="{ 'devtools-panel--mobile': isMobile }"
    >
      <div
        class="devtools-drag-bar"
        title="Drag to move"
        @pointerdown="onShellPointerDown"
      >
        <span class="devtools-drag-bar__label">Map Devtools</span>
        <span class="devtools-drag-bar__actions">
          <span class="devtools-drag-bar__hint" aria-hidden="true">⠿</span>
          <MapControlButton
            class="devtools-drag-bar__close"
            variant="icon"
            size="small"
            title="Close"
            aria-label="Close Map Devtools"
            @pointerdown.stop
            @click.stop="close"
          >
            <SvgIcon :size="16" type="mdi" :path="mdiClose" />
          </MapControlButton>
        </span>
      </div>
      <DevtoolsPanelBody />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapControlButton } from '@hungpvq/vue-map-core';
import {
  beginPanelDrag,
  panelPosStyle,
  type PanelPos,
} from '@hungpvq/map-debug';
import { isDevtoolsMobileViewport } from '@hungpvq/map-core/devtools';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiClose, mdiTools } from '@mdi/js';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { setDevtoolOpen } from '../store';
import { devtoolState } from '../store';
import DevtoolsPanelBody from './DevtoolsPanelBody.vue';

defineProps<{
  containerId?: string;
  mapId?: string;
}>();

const state = devtoolState;
const isMobile = ref(isDevtoolsMobileViewport());
const shellRef = ref<HTMLElement | null>(null);
const pos = ref<PanelPos | null>(null);
const dragging = ref(false);
let dragMoved = false;
let disposeDrag: (() => void) | undefined;

const shellStyle = computed(() => panelPosStyle(pos.value));

function refreshMobile() {
  isMobile.value = isDevtoolsMobileViewport();
}

function open() {
  setDevtoolOpen(true);
}

function close() {
  setDevtoolOpen(false);
}

function onShellPointerDown(e: PointerEvent) {
  if (!shellRef.value) return;
  dragMoved = false;
  disposeDrag?.();
  disposeDrag = beginPanelDrag(shellRef.value, e, {
    onMove: (next) => {
      pos.value = next;
    },
    onDraggingChange: (v) => {
      dragging.value = v;
    },
    onEnd: (moved) => {
      dragMoved = moved;
      disposeDrag = undefined;
    },
  });
}

function onToggleClick(e: MouseEvent) {
  if (dragMoved) {
    e.preventDefault();
    e.stopPropagation();
    dragMoved = false;
    return;
  }
  open();
}

onMounted(() => {
  refreshMobile();
  window.addEventListener('resize', refreshMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', refreshMobile);
  disposeDrag?.();
});
</script>
