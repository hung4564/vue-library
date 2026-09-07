<script lang="ts">
export default {
  name: 'DraggableModal',
};
</script>
<script setup lang="ts">
import { clampBounds, focusFirst, setModalSiblingsInert, trapTabKey } from '@hungpvq/draggable';
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  ref,
  Ref,
  watch,
} from 'vue';
import MapButton from '../parts/MapButton.vue';

import VueDraggableResizable from 'vue-draggable-resizable';
import {
  useComponent,
  useContainerOrder,
  useHighlight,
  useIcon,
  useInitAction,
  useInitItem,
  useShow,
  withShareProps,
  withShowEmit,
  withShowProps,
} from '../../hook';
import { useDragLayout } from '../../store';

const MODAL_Z_INDEX = 10000;

const { CloseIcon, DragIcon } = useIcon();
const props = defineProps({
  ...withShowProps,
  ...withShareProps,
  sticks: { type: Array, default: () => ['bl', 'br', 'tl', 'tr'] },
  top: { type: Number, default: undefined },
  left: { type: Number, default: undefined },
  bottom: { type: Number, default: undefined },
  right: { type: Number, default: undefined },
  width: { type: Number, default: 480 },
  height: { type: Number, default: 320 },
  centerX: { type: Boolean, default: true },
  centerY: { type: Boolean, default: true },
  center: { type: Boolean, default: true },
  mask: { type: Boolean, default: true },
  maskClosable: { type: Boolean, default: true },
  draggable: { type: Boolean, default: true },
  resizable: { type: Boolean, default: true },
});
const emit = defineEmits({
  ...withShowEmit,
  'update:bounds': (value: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) =>
    typeof value?.x === 'number' &&
    typeof value?.y === 'number' &&
    typeof value?.width === 'number' &&
    typeof value?.height === 'number',
});
const containerId = inject<Ref<string>>(
  'containerId',
  ref(props.containerId || ''),
);
if (!containerId.value) {
  throw new Error('Not set container id');
}
const { show, open, close } = useShow(props, emit);
const { itemId, zIndex } = useInitItem(
  containerId.value,
  show,
  {
    title: props.title,
    type: 'item-modal',
  },
  props.id,
);
const stackZIndex = computed(() => MODAL_Z_INDEX + zIndex.value);
const { isHighlight, setHighLight } = useHighlight(props.highlightMs);
useInitAction(containerId.value, itemId.value, {
  setHighLight,
  open,
  close,
});
const { onToFront } = useContainerOrder(containerId.value, itemId.value);
const dragLayout = useDragLayout(containerId.value);
const layerWidth = ref(0);
const layerHeight = ref(0);
const modalLayerTo = computed(() => `#modal-layer-${containerId.value}`);
const titleId = computed(() => `draggable-modal-title-${itemId.value}`);
const init_done = ref(false);
const isActive = ref(true);
const p_height = ref(props.height || 320);
const p_width = ref(props.width || 480);
const p_x = ref(0);
const p_y = ref(0);
const modalRoot = ref<HTMLDivElement>();
let previousFocus: HTMLElement | null = null;

function emitBounds() {
  const bounds = {
    x: p_x.value,
    y: p_y.value,
    width: p_width.value,
    height: p_height.value,
  };
  dragLayout.setItemLayout(itemId.value, { bounds });
  emit('update:bounds', bounds);
}
function applyClamp() {
  const next = clampBounds(
    p_x.value,
    p_y.value,
    p_width.value,
    p_height.value,
    layerWidth.value,
    layerHeight.value,
  );
  p_x.value = next.x;
  p_y.value = next.y;
  p_width.value = next.width;
  p_height.value = next.height;
}
function activateEv() {
  isActive.value = true;
  onToFront();
}
function deactivateEv() {
  isActive.value = false;
}
const { componentCard, componentCardHeader } = useComponent({
  ...props,
  containerId: containerId.value,
});
function measureLayer() {
  const el = document.getElementById(`modal-layer-${containerId.value}`);
  layerWidth.value = el?.clientWidth || 0;
  layerHeight.value = el?.clientHeight || 0;
}
function onResize(x: number, y: number, width: number, height: number) {
  p_width.value = width;
  p_height.value = height;
  p_x.value = x;
  p_y.value = y;
}
function onDragStop(x: number, y: number) {
  p_x.value = x;
  p_y.value = y;
  applyClamp();
  emitBounds();
}
function onResizeStop(x: number, y: number, width: number, height: number) {
  p_width.value = width;
  p_height.value = height;
  p_x.value = x;
  p_y.value = y;
  applyClamp();
  emitBounds();
}
function onClose() {
  show.value = false;
}
function onMaskClick() {
  if (props.maskClosable) {
    onClose();
  }
}
function onKeydown(event: KeyboardEvent) {
  if (!show.value || !modalRoot.value) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    onClose();
    return;
  }
  trapTabKey(modalRoot.value, event);
}
watch(
  show,
  async (visible) => {
    init_done.value = false;
    const layer = document.getElementById(`modal-layer-${containerId.value}`);
    setModalSiblingsInert(layer, visible);
    if (!visible) {
      document.removeEventListener('keydown', onKeydown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
      previousFocus = null;
      return;
    }
    previousFocus = document.activeElement as HTMLElement | null;
    await nextTick();
    init();
    await nextTick();
    if (modalRoot.value) {
      focusFirst(modalRoot.value);
    }
    document.addEventListener('keydown', onKeydown);
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  if (show.value) {
    setModalSiblingsInert(
      document.getElementById(`modal-layer-${containerId.value}`),
      false,
    );
  }
});
watch(
  () => [props.left, props.top, props.width, props.height] as const,
  ([left, top, width, height]) => {
    if (!init_done.value || !show.value) return;
    if (width != null) p_width.value = width;
    if (height != null) p_height.value = height;
    if (left != null) p_x.value = left;
    if (top != null) p_y.value = top;
    applyClamp();
  },
);
function init() {
  measureLayer();
  if (layerWidth.value <= 0 || layerHeight.value <= 0) {
    init_done.value = false;
    return;
  }
  const saved = dragLayout.getItemLayout(itemId.value)?.bounds;
  if (saved) {
    p_width.value = saved.width;
    p_height.value = saved.height;
    p_x.value = saved.x;
    p_y.value = saved.y;
    applyClamp();
    init_done.value = true;
    return;
  }
  p_width.value = props.width || 480;
  p_height.value = props.height || 320;
  const hasX = props.left != null || props.right != null;
  const hasY = props.top != null || props.bottom != null;
  if (props.left != null) {
    p_x.value = props.left;
  }
  if (props.top != null) {
    p_y.value = props.top;
  }
  if (props.right != null) {
    p_x.value = layerWidth.value - props.right - p_width.value;
  }
  if (props.bottom != null) {
    p_y.value = layerHeight.value - props.bottom - p_height.value;
  }
  if (!hasX && (props.center || props.centerX)) {
    p_x.value = Math.max(0, (layerWidth.value - p_width.value) / 2);
  }
  if (!hasY && (props.center || props.centerY)) {
    p_y.value = Math.max(0, (layerHeight.value - p_height.value) / 2);
  }
  applyClamp();
  init_done.value = true;
}
function onDragging() {
  window?.getSelection()?.removeAllRanges();
}
</script>

<template>
  <Teleport v-if="show && init_done" :to="modalLayerTo">
    <div
      ref="modalRoot"
      class="draggable-modal-root"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="titleId"
      tabindex="-1"
      :style="{ zIndex: stackZIndex }"
    >
      <div
        v-if="mask"
        class="draggable-modal-mask"
        aria-hidden="true"
        @click="onMaskClick"
      />
      <VueDraggableResizable
        v-bind="$attrs"
        class="draggable-modal-panel"
        dragHandle=".drag"
        :parent="true"
        :handles="sticks"
        :draggable="draggable"
        :resizable="resizable"
        :w="p_width"
        :h="p_height"
        :x="p_x"
        :y="p_y"
        :z="stackZIndex + 1"
        @resizing="onResize"
        @resizestop="onResizeStop"
        @dragging="onDragging"
        @dragstop="onDragStop"
        :active="isActive"
        @activated="activateEv()"
        @deactivated="deactivateEv()"
      >
        <component
          :is="componentCard"
          :width="p_width"
          :height="p_height"
          :highlight="isHighlight"
        >
          <div class="draggable-modal-desktop">
            <template v-if="!disabledHeader">
              <component :is="componentCardHeader">
                <template #title>
                  <span :id="titleId">
                    <slot name="title">
                      {{ title }}
                    </slot>
                  </span>
                </template>
                <template #pre-title>
                  <div v-if="draggable" class="draggable-popup-drag-container">
                    <DragIcon :size="16" />
                    <div class="drag grabbing"></div>
                  </div>
                </template>
                <template #extra-btn>
                  <slot name="extra-btn"></slot>
                  <map-button v-if="!disabledClose" @click.stop="onClose">
                    <CloseIcon :size="16" />
                  </map-button>
                </template>
              </component>
            </template>
            <div class="draggable-modal-desktop-content">
              <slot></slot>
            </div>
          </div>
        </component>
      </VueDraggableResizable>
    </div>
  </Teleport>
</template>
