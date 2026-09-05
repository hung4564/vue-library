<template>
  <Teleport to="body">
    <div
      v-show="isOpen"
      ref="target"
      class="context-menu-container"
      :class="{ 'context-menu-mobile': isMobile }"
      :style="menuStyle"
      @click="onBackdropClick"
    >
      <div class="context-menu-content">
        <slot />
      </div>
      <button
        v-if="isOpen && isMobile"
        type="button"
        class="context-menu-btn-close"
        aria-label="Close menu"
        @click="close"
      >
        Close
      </button>
    </div>
  </Teleport>
</template>

<script lang="ts">
export default {
  name: 'ContextMenu',
};
</script>
<script setup lang="ts">
import {
  computed,
  CSSProperties,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
} from 'vue';

const props = defineProps({
  zIndex: { type: [String, Number], default: 10000 },
});

const target = ref<HTMLDivElement>();
const isOpen = ref(false);
const isMobile = ref(false);
const stylePosition = ref<Record<string, string>>({});
const menuWidth = ref(0);
const menuHeight = ref(0);
let lastOpenEvent: MouseEvent | null = null;
let resizeObserver: ResizeObserver | undefined;
let mediaQuery: MediaQueryList | undefined;

const menuStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  zIndex: String(props.zIndex),
  ...stylePosition.value,
}));

function syncMobile(e?: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = (e ?? mediaQuery)?.matches ?? false;
}

function onDocumentPointerDown(e: MouseEvent) {
  if (!isOpen.value || !target.value) return;
  if (target.value.contains(e.target as Node)) return;
  close();
}

function onBackdropClick(e: MouseEvent) {
  if (isMobile.value && e.target === e.currentTarget) close();
}

function open(event: MouseEvent) {
  lastOpenEvent = event;
  isOpen.value = true;

  nextTick(() => {
    const menu = target.value;
    if (!menu) return;

    if (!menuWidth.value || !menuHeight.value) {
      menu.style.visibility = 'hidden';
      menu.style.display = 'block';
      menuWidth.value = menu.offsetWidth;
      menuHeight.value = menu.offsetHeight;
      menu.style.visibility = '';
      menu.style.display = '';
    }

    if (isMobile.value) {
      stylePosition.value = {
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: '#00000085',
      };
      return;
    }

    const ev = lastOpenEvent;
    lastOpenEvent = null;
    const x = ev?.clientX ?? 0;
    const y = ev?.clientY ?? 0;
    const left =
      x + menuWidth.value >= window.innerWidth
        ? x - menuWidth.value + 10
        : x;
    const top =
      y + menuHeight.value >= window.innerHeight
        ? y - menuHeight.value + 10
        : y;
    stylePosition.value = {
      left: `${left}px`,
      top: `${top}px`,
    };
  });
}

function close() {
  isOpen.value = false;
  stylePosition.value = {};
  lastOpenEvent = null;
}

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 640px)');
  syncMobile(mediaQuery);
  mediaQuery.addEventListener('change', syncMobile);
  document.addEventListener('mousedown', onDocumentPointerDown);

  if (target.value) {
    resizeObserver = new ResizeObserver(() => {
      if (!target.value) return;
      menuWidth.value = target.value.offsetWidth;
      menuHeight.value = target.value.offsetHeight;
    });
    resizeObserver.observe(target.value);
  }
});

onUnmounted(() => {
  mediaQuery?.removeEventListener('change', syncMobile);
  document.removeEventListener('mousedown', onDocumentPointerDown);
  resizeObserver?.disconnect();
});

defineExpose({ open, close });
</script>
