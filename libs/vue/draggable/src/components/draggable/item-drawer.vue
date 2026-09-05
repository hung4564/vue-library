<script lang="ts">
export default {
  name: 'DraggableDrawer',
};
</script>
<script setup lang="ts">
import { ContextMenu } from '@hungpvq/vue-content-menu';
import {
  computed,
  inject,
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
import { useDrawerItem } from '../../store';
import { LocationSideBar } from '../../types';
import MapButton from '../parts/MapButton.vue';

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
  throw 'Not set container id';
}

const location = computed(() => props.location as LocationSideBar);
const isHorizontal = computed(
  () => location.value === 'left' || location.value === 'right',
);

const { show, open, close } = useShow(props, emit);
const { itemId } = useInitDrawer(containerId.value, show, {
  title: props.title,
  type: 'item-drawer',
  location,
});
const { isHighlight, setHighLight } = useHighlight();
useInitAction(containerId.value, itemId.value, {
  setHighLight,
  open,
  close,
});
const drawerStore = useDrawerItem(containerId.value);
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

const p_size = ref(props.size);
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
  },
  { immediate: true },
);

function onClose() {
  show.value = false;
}

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
      class="draggable-drawer"
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
                <slot name="title">
                  {{ title }}
                </slot>
              </template>
              <template #extra-btn>
                <slot name="extra-btn"></slot>
                <map-button
                  v-if="showSwitcher"
                  aria-label="Open drawer menu"
                  role="button"
                  @click="openMenu"
                >
                  <SidebarOpenMenu :size="16" />
                </map-button>
                <map-button v-if="!disabledClose" @click="onClose">
                  <CloseIcon :size="16" />
                </map-button>
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
        @mousedown="onResizeStart"
        @touchstart.prevent="onResizeStart"
      />
    </div>
  </Teleport>
  <ContextMenu ref="contextMenuRef">
    <ul class="context-menu">
      <li
        v-for="option in availableDrawerItems"
        :key="option.id"
        class="context-menu__item clickable"
        :class="{ 'is-active': option.id === activeDrawerId }"
        @click.stop="selectDrawer(option.id)"
      >
        <span v-html="option.title"></span>
      </li>
    </ul>
  </ContextMenu>
</template>
