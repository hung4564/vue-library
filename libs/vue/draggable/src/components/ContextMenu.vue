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
      <div
        ref="content"
        class="context-menu-content"
        role="menu"
        tabindex="-1"
        aria-orientation="vertical"
        :aria-label="ariaLabel"
      >
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
  clearMenuTypeahead,
  focusFirst,
  getMenuItems,
  handleMenuKeydown,
  restoreFocus,
  trapTabKey,
} from '@hungpvq/draggable';
import {
  computed,
  CSSProperties,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';

const props = defineProps({
  zIndex: { type: [String, Number], default: 10000 },
  /** Accessible name for the menu region. */
  ariaLabel: { type: String, default: 'Context menu' },
});

const emit = defineEmits<{
  'update:open': [open: boolean];
}>();

const target = ref<HTMLDivElement>();
const content = ref<HTMLDivElement>();
const isOpen = ref(false);
const isMobile = ref(false);
const stylePosition = ref<Record<string, string>>({});
const menuWidth = ref(0);
const menuHeight = ref(0);
let lastOpenEvent: MouseEvent | null = null;
let previousFocus: HTMLElement | null = null;
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

function focusMenu() {
  const root = content.value;
  if (!root) return;
  const items = getMenuItems(root);
  if (items[0]) {
    items[0].focus();
    return;
  }
  focusFirst(root);
}

function onDocumentKeydown(e: KeyboardEvent) {
  if (!isOpen.value) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    close();
    return;
  }
  if (!content.value) return;
  if (e.key === 'Tab') {
    const items = getMenuItems(content.value);
    if (items.length > 0) {
      e.preventDefault();
      const active = document.activeElement as HTMLElement | null;
      const idx = active ? items.indexOf(active) : -1;
      if (e.shiftKey) {
        const prev = idx <= 0 ? items.length - 1 : idx - 1;
        items[prev].focus();
      } else {
        const next = idx >= items.length - 1 ? 0 : idx + 1;
        items[next].focus();
      }
      return;
    }
    trapTabKey(content.value, e);
    return;
  }
  handleMenuKeydown(content.value, e);
}

function onBackdropClick(e: MouseEvent) {
  if (isMobile.value && e.target === e.currentTarget) close();
}

function open(event: MouseEvent) {
  lastOpenEvent = event;
  previousFocus = document.activeElement as HTMLElement | null;
  isOpen.value = true;
  emit('update:open', true);

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
  if (!isOpen.value) return;
  isOpen.value = false;
  stylePosition.value = {};
  lastOpenEvent = null;
  clearMenuTypeahead();
  emit('update:open', false);
  restoreFocus(previousFocus);
  previousFocus = null;
}

watch(isOpen, (openNow) => {
  if (openNow) {
    nextTick(() => {
      focusMenu();
    });
  }
});

onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 640px)');
  syncMobile(mediaQuery);
  mediaQuery.addEventListener('change', syncMobile);
  document.addEventListener('mousedown', onDocumentPointerDown);
  document.addEventListener('keydown', onDocumentKeydown);

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
  document.removeEventListener('keydown', onDocumentKeydown);
  resizeObserver?.disconnect();
  clearMenuTypeahead();
});

defineExpose({ open, close });
</script>
