<script lang="ts">
export default {
  name: 'DraggableModal',
};
</script>
<script setup lang="ts">
import { computed, inject, nextTick, ref, Ref, watch } from 'vue';
import MapButton from '../parts/MapButton.vue';

import VueDraggableResizable from 'vue-draggable-resizable';
import {
  useComponent,
  useHighlight,
  useIcon,
  useInitAction,
  useInitItem,
  useShow,
  withShareProps,
  withShowEmit,
  withShowProps,
} from '../../hook';

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
const emit = defineEmits({ ...withShowEmit });
const containerId = inject<Ref<string>>(
  'containerId',
  ref(props.containerId || ''),
);
if (!containerId.value) {
  throw 'Not set container id';
}
const { show, open, close } = useShow(props, emit);
const { itemId, zIndex } = useInitItem(containerId.value, show, {
  title: props.title,
  type: 'item-modal',
});
const stackZIndex = computed(() => MODAL_Z_INDEX + zIndex.value);
const { isHighlight, setHighLight } = useHighlight();
useInitAction(containerId.value, itemId.value, {
  setHighLight,
  open,
  close,
});
const layerWidth = ref(0);
const layerHeight = ref(0);
const modalLayerTo = computed(() => `#modal-layer-${containerId.value}`);
const init_done = ref(false);
const isActive = ref(true);
const p_height = ref(props.height || 320);
const p_width = ref(props.width || 480);
const p_x = ref(0);
const p_y = ref(0);
function activateEv() {
  isActive.value = true;
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
function onDrag(x: number, y: number) {
  p_x.value = x;
  p_y.value = y;
}
function onClose() {
  show.value = false;
}
function onMaskClick() {
  if (props.maskClosable) {
    onClose();
  }
}
watch(
  show,
  async () => {
    init_done.value = false;
    if (!show.value) return;
    await nextTick();
    init();
  },
  { immediate: true },
);
function init() {
  measureLayer();
  if (layerWidth.value <= 0 || layerHeight.value <= 0) {
    init_done.value = false;
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
  init_done.value = true;
}
function onDragging() {
  window?.getSelection()?.removeAllRanges();
}
</script>

<template>
  <Teleport v-if="show && init_done" :to="modalLayerTo">
    <div
      class="draggable-modal-root"
      :style="{ zIndex: stackZIndex }"
    >
      <div
        v-if="mask"
        class="draggable-modal-mask"
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
        @dragging="onDragging"
        @dragstop="onDrag"
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
                  <slot name="title">
                    {{ title }}
                  </slot>
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
