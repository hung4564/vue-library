<script setup lang="ts">
import type { DemoHelpSection } from '@hungpvq/demo-map-datasets';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { getDemoPageGuide, type DemoPageGuide } from '../demo-guides';

const props = defineProps<{
  /** Override auto route lookup. */
  guide?: DemoPageGuide;
  intro?: string;
  sections?: DemoHelpSection[];
}>();

const MOBILE_MQ = '(max-width: 640px)';
const DRAG_THRESHOLD_PX = 4;
const route = useRoute();

const resolved = computed<DemoPageGuide | undefined>(() => {
  if (props.guide) return props.guide;
  if (props.sections?.length) {
    return { intro: props.intro, sections: props.sections };
  }
  return getDemoPageGuide(route.path);
});

const open = ref(true);
const isMobile = ref(false);
const panelRef = ref<HTMLElement | null>(null);
/** Absolute left/top inside offsetParent after the user drags. */
const pos = ref<{ left: number; top: number } | null>(null);
const dragging = ref(false);

let mq: MediaQueryList | undefined;
let dragMoved = false;
let dragPointerId: number | null = null;
let dragOriginX = 0;
let dragOriginY = 0;
let dragStartLeft = 0;
let dragStartTop = 0;

function syncMobile() {
  isMobile.value = !!mq?.matches;
  if (isMobile.value) open.value = false;
}

function onMqChange() {
  const wasMobile = isMobile.value;
  syncMobile();
  if (!wasMobile && isMobile.value) open.value = false;
  if (wasMobile && !isMobile.value) open.value = true;
}

onMounted(() => {
  mq = window.matchMedia(MOBILE_MQ);
  syncMobile();
  mq.addEventListener('change', onMqChange);
});

onUnmounted(() => {
  mq?.removeEventListener('change', onMqChange);
  detachDragListeners();
});

function toggle() {
  open.value = !open.value;
}

function offsetParentRect(el: HTMLElement) {
  const parent = el.offsetParent as HTMLElement | null;
  if (!parent) {
    return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
  }
  const r = parent.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, height: r.height };
}

function clampPos(left: number, top: number, el: HTMLElement) {
  const parent = offsetParentRect(el);
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  const maxL = Math.max(0, parent.width - w);
  const maxT = Math.max(0, parent.height - h);
  return {
    left: Math.min(Math.max(0, left), maxL),
    top: Math.min(Math.max(0, top), maxT),
  };
}

function detachDragListeners() {
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', onPointerUp);
  window.removeEventListener('pointercancel', onPointerUp);
}

function onHeaderPointerDown(e: PointerEvent) {
  if (e.button !== 0 || !panelRef.value) return;
  const el = panelRef.value;
  const parent = offsetParentRect(el);
  const rect = el.getBoundingClientRect();
  dragPointerId = e.pointerId;
  dragMoved = false;
  dragging.value = false;
  dragOriginX = e.clientX;
  dragOriginY = e.clientY;
  dragStartLeft = rect.left - parent.left;
  dragStartTop = rect.top - parent.top;
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}

function onPointerMove(e: PointerEvent) {
  if (e.pointerId !== dragPointerId || !panelRef.value) return;
  const dx = e.clientX - dragOriginX;
  const dy = e.clientY - dragOriginY;
  if (!dragMoved && Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
  dragMoved = true;
  dragging.value = true;
  e.preventDefault();
  pos.value = clampPos(
    dragStartLeft + dx,
    dragStartTop + dy,
    panelRef.value,
  );
}

function onPointerUp(e: PointerEvent) {
  if (e.pointerId !== dragPointerId) return;
  detachDragListeners();
  dragPointerId = null;
  dragging.value = false;
}

function onHeaderClick(e: MouseEvent) {
  if (dragMoved) {
    e.preventDefault();
    e.stopPropagation();
    dragMoved = false;
    return;
  }
  toggle();
}

const panelStyle = computed(() => {
  if (!pos.value) return undefined;
  return {
    left: `${pos.value.left}px`,
    top: `${pos.value.top}px`,
    right: 'auto',
    bottom: 'auto',
  };
});
</script>

<template>
  <aside
    v-if="resolved?.sections?.length"
    ref="panelRef"
    class="demo-help"
    :class="{
      'demo-help--open': open,
      'demo-help--mobile': isMobile,
      'demo-help--dragging': dragging,
      'demo-help--moved': !!pos,
    }"
    :style="panelStyle"
  >
    <button
      type="button"
      class="demo-help__toggle"
      :aria-expanded="open"
      aria-controls="demo-page-help"
      title="Drag to move · click to show/hide"
      @pointerdown="onHeaderPointerDown"
      @click="onHeaderClick"
    >
      <span class="demo-help__toggle-label">
        {{ open ? 'Hide guide' : 'Demo guide' }}
      </span>
      <span class="demo-help__toggle-icon" aria-hidden="true">
        {{ open ? '▾' : '▸' }}
      </span>
    </button>

    <div
      v-show="open"
      id="demo-page-help"
      class="demo-help__body"
      role="region"
      aria-label="Demo guide"
    >
      <p v-if="resolved.intro" class="demo-help__intro">
        {{ resolved.intro }}
      </p>
      <ul class="demo-help__list">
        <li
          v-for="section in resolved.sections"
          :key="section.id"
          class="demo-help__item"
        >
          <div class="demo-help__title">{{ section.title }}</div>
          <div class="demo-help__text">{{ section.body }}</div>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style scoped>
.demo-help {
  position: absolute;
  z-index: 3;
  /* Below top toolbar; inset from right so nav stays free; short of FAB */
  top: 56px;
  right: 56px;
  left: auto;
  bottom: auto;
  width: min(300px, calc(100vw - 96px));
  max-height: min(45vh, calc(100% - 56px - 100px));
  display: flex;
  flex-direction: column;
  border-radius: 10px;
  background: color-mix(in srgb, canvas 94%, transparent);
  box-shadow: 0 2px 12px rgb(0 0 0 / 18%);
  font:
    12px/1.45 system-ui,
    sans-serif;
  color: CanvasText;
  overflow: hidden;
  pointer-events: auto;
}

.demo-help--moved {
  /* Keep width when left/top take over from right anchoring */
  right: auto;
  bottom: auto;
}

.demo-help--dragging {
  user-select: none;
  box-shadow: 0 4px 18px rgb(0 0 0 / 28%);
}

.demo-help__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  font: inherit;
  font-weight: 600;
  color: inherit;
  cursor: grab;
  text-align: left;
  touch-action: none;
}

.demo-help__toggle:active {
  cursor: grabbing;
}

.demo-help__toggle:hover {
  background: color-mix(in srgb, CanvasText 6%, transparent);
}

.demo-help__toggle-icon {
  opacity: 0.7;
  font-size: 11px;
}

.demo-help__body {
  padding: 0 12px 12px;
  overflow: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

.demo-help__intro {
  margin: 0 0 10px;
  opacity: 0.85;
}

.demo-help__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.demo-help__title {
  font-weight: 600;
  margin-bottom: 2px;
}

.demo-help__text {
  opacity: 0.88;
  font-size: 11px;
}

.demo-help--mobile {
  top: auto;
  left: 8px;
  right: 8px;
  /* Above map-devtools FAB (~bottom:45px / right:50px) */
  bottom: calc(96px + env(safe-area-inset-bottom, 0px));
  width: auto;
  max-height: min(36vh, calc(100% - 120px));
}

.demo-help--mobile.demo-help--moved {
  left: auto;
  right: auto;
  bottom: auto;
  width: min(300px, calc(100vw - 16px));
}

.demo-help--mobile:not(.demo-help--open):not(.demo-help--moved) {
  width: auto;
  left: auto;
  right: 8px;
  max-width: calc(100vw - 16px);
}

.demo-help--mobile:not(.demo-help--open) .demo-help__toggle {
  padding: 10px 14px;
}
</style>
