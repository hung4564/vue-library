<script lang="ts">
export default {
  name: 'DraggableItemPopup',
};
</script>
<script setup lang="ts">
import { computed, inject, ref, Ref, watch } from 'vue';
import MapButton from '../parts/MapButton.vue';

import VueDraggableResizable from 'vue-draggable-resizable';
import {
  useComponent,
  useContainerOrder,
  useContainerSize,
  useExpand,
  useIcon,
  useInit,
  useShow,
  withExpandEmit,
  withExpandProps,
  withShareProps,
  withShowEmit,
  withShowProps,
} from '../../hook';
const {
  CloseIcon,
  CloseExpandedIcon,
  DragIcon,
  ExpandedIcon,
  ToBackIcon,
  ToFrontIcon,
} = useIcon();
const props = defineProps({
  ...withShowProps,
  ...withExpandProps,
  ...withShareProps,
  sticks: { type: Array, default: () => ['bl', 'br'] },
  top: { type: Number, default: undefined },
  left: { type: Number, default: undefined },
  bottom: { type: Number, default: undefined },
  right: { type: Number, default: undefined },
  width: { type: Number, default: undefined },
  height: { type: Number, default: undefined },
  centerX: Boolean,
  centerY: Boolean,
  center: Boolean,
});
const emit = defineEmits({ ...withShowEmit, ...withExpandEmit });
const containerId = inject<Ref<string>>(
  'containerId',
  ref(props.containerId || '')
);
if (!containerId.value) {
  throw 'Not set container id';
}
const { show } = useShow(props, emit);
const { zIndex, itemId } = useInit(containerId.value, show);
const { containerWidth, containerHeight } = useContainerSize(containerId.value);
const { isLast, isFirst, isHasItems, onToBack, onToFront } = useContainerOrder(
  containerId.value,
  itemId.value
);
const init_done = ref(false);
const isActive = ref(false);
const p_height = ref(props.height || 200);
const old_height = ref(p_height.value);
const p_width = ref(props.width || 200);
const p_x = ref(0);
const p_y = ref(0);
const { expand } = useExpand(props, emit, true);
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
function onResize(x: number, y: number, width: number, height: number) {
  p_width.value = width;
  p_height.value = height;
}
function onClose() {
  show.value = false;
}
watch(
  show,
  () => {
    init();
  },
  { immediate: true }
);
function init() {
  init_done.value = false;
  if (!show) return;
  if (props.left != null) {
    p_x.value = props.left;
  }
  if (props.top != null) {
    p_y.value = props.top;
  }
  if (props.right) {
    p_x.value = containerWidth.value - props.right - p_width.value;
  }
  if (props.bottom) {
    p_y.value = containerHeight.value - props.bottom - p_height.value;
  }
  if (props.center || props.centerX) {
    p_x.value = (containerWidth.value - p_width.value) / 2;
  }
  if (props.center || props.centerY) {
    p_y.value = (containerHeight.value - p_height.value) / 2;
  }
  init_done.value = true;
}
function onToggleExpanded() {
  if (expand.value && p_height.value > 50) {
    old_height.value = p_height.value;
  }
  expand.value = !expand.value;
  p_height.value = expand.value ? old_height.value : 50;
}
function onDragging() {
  window?.getSelection()?.removeAllRanges();
}
</script>

<template>
  <VueDraggableResizable
    v-if="show && init_done"
    v-bind="$attrs"
    dragHandle=".drag"
    :parent="true"
    :handles="sticks"
    :w="p_width"
    :h="p_height"
    :x="p_x"
    :y="p_y"
    :z="zIndex"
    @resizing="onResize"
    :active="isActive"
    @activated="activateEv()"
    @deactivated="deactivateEv()"
    @dragging="onDragging"
  >
    <component :is="componentCard" :width="p_width" :height="p_height">
      <div class="draggable-popup-desktop">
        <template v-if="!disabledHeader">
          <component :is="componentCardHeader">
            <template #title>
              <slot name="title">
                {{ title }}
              </slot>
            </template>
            <template #pre-title>
              <div class="draggable-popup-drag-container">
                <DragIcon :size="16" />
                <div class="drag grabbing"></div>
              </div>
            </template>
            <template #extra-btn>
              <slot name="extra-btn"></slot>
              <template v-if="isHasItems && !disabledOrder">
                <map-button :disabled="isFirst" @click="onToBack()">
                  <ToBackIcon :size="16" />
                </map-button>
                <map-button :disabled="isLast" @click="onToFront()">
                  <ToFrontIcon :size="16" />
                </map-button>
              </template>
              <map-button @click="onToggleExpanded">
                <ExpandedIcon v-if="expand" :size="16" />
                <CloseExpandedIcon v-else :size="16" />
              </map-button>
              <map-button v-if="!disabledClose" @click="onClose">
                <CloseIcon :size="16" />
              </map-button>
            </template>
          </component>
        </template>
        <div v-show="expand" class="draggable-popup-desktop-content">
          <slot></slot>
        </div>
      </div>
    </component>
  </VueDraggableResizable>
</template>

<style scoped>
.grabbing {
  cursor: -webkit-grabbing;
  cursor: grabbing;
}

.draggable-popup-desktop .map-spacer {
  flex-grow: 1;
}

.draggable-popup-desktop .map-divider {
  flex-grow: 0;
}

.vdr {
  border: none;
}

.draggable-popup-desktop {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.draggable-popup-desktop-content {
  flex-grow: 1;
  overflow: auto;
}

.draggable-popup-drag-container {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  flex-grow: 0;
  flex: 0 0 30px;
}

.draggable-popup-drag-container > .material-design-icon {
  margin-top: 8px;
}

.draggable-popup-drag-container .drag {
  position: absolute;
  top: 0;
  height: 100%;
  width: 30px;
  z-index: 2;
}
</style>
<style lang="scss">
.resizable {
  .handle {
    position: absolute;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    position: absolute;
    font-size: 1px;
    background: #fff;
    border: 1px solid #6c6c6c;
    -webkit-box-shadow: 0 0 2px #bbb;
    box-shadow: 0 0 2px #bbb;
    z-index: 20;
  }

  .handle-bl {
    width: 8px;
    height: 8px;
    bottom: 0;
    left: 0;
  }

  .handle-br {
    width: 8px;
    height: 8px;
    bottom: 0;
    right: 0;
  }

  .handle-br,
  .handle-tl {
    cursor: nwse-resize;
  }

  .handle-bl,
  .handle-tr {
    cursor: nesw-resize;
  }
}
</style>
