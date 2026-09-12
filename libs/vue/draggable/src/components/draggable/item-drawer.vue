<script lang="ts">
export default {
  name: 'DraggableDrawer',
};
</script>
<script setup lang="ts">
import ContextMenu from '../ContextMenu.vue';
import ContextMenuItem from '../ContextMenuItem.vue';
import { focusFirst, restoreFocus } from '@hungpvq/draggable';
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  Ref,
  watch,
} from 'vue';
import {
  useComponent,
  useContainerSize,
  useHighlight,
  useIcon,
  useInitAction,
  useShow,
  withShareProps,
  withShowEmit,
  withShowProps,
} from '../../hook';
import { useInitDrawer } from '../../hook/useInitDrawer';
import { useDragLayout, useDrawerItem } from '../../store';
import { LocationSideBar } from '../../types';
import DragButton from '../parts/DragButton.vue';

const { CloseIcon, SidebarOpenMenu } = useIcon();

const props = defineProps({
  ...withShowProps,
  ...withShareProps,
  location: {
    type: String,
    default: 'right',
    validator: (value: string) =>
      ['left', 'right', 'top', 'bottom'].includes(value),
  },
  size: { type: Number, default: 360 },
  minSize: { type: Number, default: 200 },
  maxSize: { type: Number, default: undefined },
  resizable: { type: Boolean, default: true },
});

const emit = defineEmits({
  ...withShowEmit,
  'update:size': (value: number) => typeof value === 'number',
  resize: (value: number) => typeof value === 'number',
});

const containerId = inject<Ref<string>>(
  'containerId',
  ref(props.containerId || ''),
);
if (!containerId.value) {
  throw new Error('Not set container id');
}

const location = computed(() => props.location as LocationSideBar);
const isHorizontal = computed(
  () => location.value === 'left' || location.value === 'right',
);

const { show, open, close } = useShow(props, emit);
const { itemId } = useInitDrawer(
  containerId.value,
  show,
  {
    title: props.title,
    type: 'item-drawer',
    location,
  },
  props.id,
);
const { isHighlight, setHighLight } = useHighlight(props.highlightMs);
useInitAction(containerId.value, itemId.value, {
  setHighLight,
  open,
  close,
});
const drawerStore = useDrawerItem(containerId.value);
const dragLayout = useDragLayout(containerId.value);
const { containerWidth, containerHeight } = useContainerSize(containerId.value);
const { componentCard, componentCardHeader } = useComponent({
  ...props,
  containerId: containerId.value,
});

const contextMenuRef = ref<
  | {
      open(event: MouseEvent): void;
      close(): void;
    }
  | undefined
>();
const menuOpen = ref(false);
const drawerRoot = ref<HTMLElement>();
const titleId = computed(() => `drawer-title-${itemId.value}`);
let previousFocus: HTMLElement | null = null;

const savedLayout = dragLayout.getItemLayout(itemId.value);
const p_size = ref(savedLayout?.size ?? props.size);
const slotTo = computed(
  () => `#drawer-${location.value}-${containerId.value}`,
);

const availableDrawerItems = computed(() =>
  drawerStore.getItemsForLocation(location.value),
);
const activeDrawerId = computed(() =>
  drawerStore.getShowForLocation(location.value),
);
const showSwitcher = computed(() => availableDrawerItems.value.length > 1);

watch(
  () => props.size,
  (value) => {
    if (value != null) {
      p_size.value = value;
    }
  },
);

function clampSize(value: number) {
  const centerSize = isHorizontal.value
    ? containerWidth.value
    : containerHeight.value;
  const available = (centerSize || 0) + p_size.value;
  let next = value;
  if (props.maxSize != null) {
    next = Math.min(next, props.maxSize);
  }
  if (available > 0) {
    next = Math.min(next, Math.max(props.minSize, available - 80));
  }
  return Math.max(props.minSize, next);
}

watch(
  [containerWidth, containerHeight, isHorizontal],
  () => {
    p_size.value = clampSize(p_size.value);
  },
  { immediate: true },
);

function setSize(value: number) {
  const next = clampSize(value);
  p_size.value = next;
  if (show.value) {
    drawerStore.setDrawerSize(location.value, next);
  }
  dragLayout.setItemLayout(itemId.value, {
    size: next,
    location: location.value,
  });
  emit('update:size', next);
  emit('resize', next);
}

watch(
  [show, p_size, location],
  ([isShow, size, loc], prev) => {
    const prevLoc = prev?.[2] as LocationSideBar | undefined;
    if (prevLoc && prevLoc !== loc) {
      drawerStore.moveDrawerLocation(itemId.value, loc);
    }
    drawerStore.registerDrawerShow(
      itemId.value,
      loc,
      !!isShow,
      isShow ? size : undefined,
    );
    dragLayout.setItemLayout(itemId.value, {
      size: size as number,
      location: loc as LocationSideBar,
    });
  },
  { immediate: true },
);

function onClose() {
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (!show.value || event.key !== 'Escape') return;
  if (menuOpen.value) return;
  const root = drawerRoot.value;
  if (!root) return;
  const target = event.target as Node | null;
  if (target && !root.contains(target) && document.activeElement !== root) {
    return;
  }
  event.preventDefault();
  onClose();
}

watch(
  show,
  async (visible) => {
    document.removeEventListener('keydown', onKeydown);
    if (!visible) {
      restoreFocus(previousFocus);
      previousFocus = null;
      return;
    }
    previousFocus = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKeydown);
    await nextTick();
    if (drawerRoot.value) focusFirst(drawerRoot.value);
  },
  { immediate: true },
);

function openMenu(e: MouseEvent) {
  contextMenuRef.value?.open(e);
}

function closeContextMenu() {
  contextMenuRef.value?.close();
}

function selectDrawer(nextId: string) {
  drawerStore.registerDrawerShow(
    nextId,
    location.value,
    true,
    p_size.value,
  );
  closeContextMenu();
}

const isResizing = ref(false);
let startPos = 0;
let startSize = 0;

function onResizeStart(event: MouseEvent | TouchEvent) {
  if (!props.resizable) return;
  event.preventDefault();
  isResizing.value = true;
  startSize = p_size.value;
  if ('touches' in event) {
    startPos = isHorizontal.value
      ? event.touches[0].clientX
      : event.touches[0].clientY;
  } else {
    startPos = isHorizontal.value ? event.clientX : event.clientY;
  }
  window.addEventListener('mousemove', onResizeMove);
  window.addEventListener('mouseup', onResizeEnd);
  window.addEventListener('touchmove', onResizeMove, { passive: false });
  window.addEventListener('touchend', onResizeEnd);
}

function onResizeMove(event: MouseEvent | TouchEvent) {
  if (!isResizing.value) return;
  event.preventDefault();
  let current = 0;
  if ('touches' in event) {
    current = isHorizontal.value
      ? event.touches[0].clientX
      : event.touches[0].clientY;
  } else {
    current = isHorizontal.value ? event.clientX : event.clientY;
  }
  const delta = current - startPos;
  let next = startSize;
  switch (location.value) {
    case 'left':
      next = startSize + delta;
      break;
    case 'right':
      next = startSize - delta;
      break;
    case 'top':
      next = startSize + delta;
      break;
    case 'bottom':
      next = startSize - delta;
      break;
  }
  setSize(next);
}

function onResizeEnd() {
  isResizing.value = false;
  window.removeEventListener('mousemove', onResizeMove);
  window.removeEventListener('mouseup', onResizeEnd);
  window.removeEventListener('touchmove', onResizeMove);
  window.removeEventListener('touchend', onResizeEnd);
}

onBeforeUnmount(() => {
  onResizeEnd();
  document.removeEventListener('keydown', onKeydown);
});

const resizeHandleClass = computed(() => {
  return [
    'draggable-drawer-resize',
    `draggable-drawer-resize--${location.value}`,
    { 'is-resizing': isResizing.value },
  ];
});
</script>

<template>
  <Teleport v-if="show" :to="slotTo">
    <div
      ref="drawerRoot"
      class="draggable-drawer"
      role="dialog"
      :aria-labelledby="titleId"
      tabindex="-1"
      :class="[
        `draggable-drawer--${location}`,
        { 'draggable-drawer--resizing': isResizing },
      ]"
    >
      <component :is="componentCard" :highlight="isHighlight">
        <div class="draggable-drawer-inner">
          <template v-if="!disabledHeader">
            <component :is="componentCardHeader">
              <template #title>
                <span :id="titleId">
                  <slot name="title">
                    {{ title }}
                  </slot>
                </span>
              </template>
              <template #extra-btn>
                <slot name="extra-btn"></slot>
                <drag-button
                  v-if="showSwitcher"
                  aria-label="Open drawer menu"
                  aria-haspopup="menu"
                  :aria-expanded="menuOpen ? 'true' : 'false'"
                  @click="openMenu"
                >
                  <SidebarOpenMenu :size="16" />
                </drag-button>
                <drag-button
                  v-if="!disabledClose"
                  aria-label="Close drawer"
                  @click="onClose"
                >
                  <CloseIcon :size="16" />
                </drag-button>
              </template>
            </component>
          </template>
          <div class="draggable-drawer-content">
            <slot></slot>
          </div>
        </div>
      </component>
      <div
        v-if="resizable"
        :class="resizeHandleClass"
        aria-hidden="true"
        @mousedown="onResizeStart"
        @touchstart.prevent="onResizeStart"
      />
    </div>
  </Teleport>
  <ContextMenu
    ref="contextMenuRef"
    aria-label="Switch drawer panel"
    @update:open="menuOpen = $event"
  >
    <ul class="context-menu" role="presentation">
      <ContextMenuItem
        v-for="option in availableDrawerItems"
        :key="option.id"
        :active="option.id === activeDrawerId"
        @click="selectDrawer(option.id)"
      >
        <span>{{ option.title }}</span>
      </ContextMenuItem>
    </ul>
  </ContextMenu>
</template>
