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
  clampPanelPos,
  panelPosStyle,
  samePanelPos,
  syncDevtoolsShellPos,
  type DevtoolsShellLayout,
  type PanelPos,
} from '@hungpvq/map-debug';
import { isDevtoolsMobileViewport } from '@hungpvq/map-core/devtools';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiClose, mdiTools } from '@mdi/js';
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';
import { setDevtoolOpen, devtoolState } from '../store';
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
const layout: DevtoolsShellLayout = {
  lastSize: { width: 0, height: 0 },
  savedTogglePos: null,
  wasOpen: false,
  draggedWhileOpen: false,
};
let dragMoved = false;
let disposeDrag: (() => void) | undefined;

const shellStyle = computed(() => panelPosStyle(pos.value));

function syncShell() {
  const el = shellRef.value;
  if (!el) return;
  const synced = syncDevtoolsShellPos({
    pos: pos.value,
    el,
    isOpen: state.isOpen,
    layout,
  });
  Object.assign(layout, synced.layout);
  if (synced.pos) {
    if (!pos.value || !samePanelPos(synced.pos, pos.value)) {
      pos.value = synced.pos;
    }
  } else if (pos.value) {
    pos.value = null;
  }
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
      if (state.isOpen) layout.draggedWhileOpen = true;
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
  setDevtoolOpen(true);
}

function onWindowResize() {
  isMobile.value = isDevtoolsMobileViewport();
  const el = shellRef.value;
  if (!el || !pos.value) return;
  const next = clampPanelPos(pos.value.left, pos.value.top, el);
  if (!samePanelPos(next, pos.value)) pos.value = next;
}

watch(
  () => state.isOpen,
  async () => {
    await nextTick();
    syncShell();
  },
);

watch(isMobile, async () => {
  await nextTick();
  syncShell();
});

onMounted(() => {
  isMobile.value = isDevtoolsMobileViewport();
  layout.wasOpen = state.isOpen;
  const el = shellRef.value;
  if (el) {
    layout.lastSize = { width: el.offsetWidth, height: el.offsetHeight };
  }
  window.addEventListener('resize', onWindowResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
  disposeDrag?.();
});
</script>
