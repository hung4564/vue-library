<script lang="ts">
export default {
  name: 'DraggableItemPopup',
};
</script>
<script setup lang="ts">
import { clampBounds, focusFirst, restoreFocus, trapTabKey } from '@hungpvq/draggable';
import { inject, nextTick, onBeforeUnmount, ref, Ref, watch } from 'vue';
import DragButton from '../parts/DragButton.vue';

import VueDraggableResizable from 'vue-draggable-resizable';
import {
  useComponent,
  useContainerOrder,
  useContainerSize,
  useExpand,
  useHighlight,
  useIcon,
  useInitAction,
  useInitItem,
  useShow,
  withExpandEmit,
  withExpandProps,
  withShareProps,
  withShowEmit,
  withShowProps,
} from '../../hook';
import { useDragLayout } from '../../store';
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
const emit = defineEmits({
  ...withShowEmit,
  ...withExpandEmit,
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
const { zIndex, itemId } = useInitItem(
  containerId.value,
  show,
  {
    title: props.title,
    type: 'item-popup',
  },
  props.id,
);
const { isHighlight, setHighLight } = useHighlight(props.highlightMs);
useInitAction(containerId.value, itemId.value, {
  setHighLight,
  open,
  close,
});
const { containerWidth, containerHeight } = useContainerSize(containerId.value);
const { isLast, isFirst, isHasItems, onToBack, onToFront } = useContainerOrder(
  containerId.value,
  itemId.value,
);
const dragLayout = useDragLayout(containerId.value);
const init_done = ref(false);
/** After first layout, re-show keeps in-memory bounds (React `boundsRef` parity). */
const hasPositioned = ref(false);
const isActive = ref(false);
const p_height = ref(props.height || 200);
const old_height = ref(p_height.value);
const p_width = ref(props.width || 200);
const p_x = ref(0);
const p_y = ref(0);
/** Remount VDR when center size changes so it remeasures parent after drawer layout. */
const layoutKey = ref(0);
const { expand } = useExpand(props, emit, true);
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
    containerWidth.value,
    containerHeight.value,
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
function onResize(x: number, y: number, width: number, height: number) {
  p_x.value = x;
  p_y.value = y;
  p_width.value = width;
  p_height.value = height;
}
function onDragging(x: number, y: number) {
  p_x.value = x;
  p_y.value = y;
  window?.getSelection()?.removeAllRanges();
}
function onDragStop(x: number, y: number) {
  p_x.value = x;
  p_y.value = y;
  applyClamp();
  emitBounds();
}
function onResizeStop(x: number, y: number, width: number, height: number) {
  p_x.value = x;
  p_y.value = y;
  p_width.value = width;
  p_height.value = height;
  applyClamp();
  emitBounds();
}
const panelRoot = ref<HTMLElement>();
const titleId = `popup-title-${itemId.value}`;
let previousFocus: HTMLElement | null = null;

function onClose() {
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (!show.value) return;
  const root = panelRoot.value;
  if (!root) return;
  if (event.key === 'Tab') {
    trapTabKey(root, event);
    return;
  }
  if (event.key !== 'Escape') return;
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
      // Persist before VDR unmounts so toggle show restores the same place.
      if (hasPositioned.value) emitBounds();
      init();
      restoreFocus(previousFocus);
      previousFocus = null;
      return;
    }
    init();
    previousFocus = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', onKeydown);
    await nextTick();
    if (panelRoot.value) focusFirst(panelRoot.value);
  },
  { immediate: true },
);
watch([containerWidth, containerHeight], (next, prev) => {
  if (!show.value || !init_done.value) return;
  applyClamp();
  const [nw, nh] = next;
  const [pw, ph] = prev || [0, 0];
  if (nw !== pw || nh !== ph) {
    layoutKey.value += 1;
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
  if (!show.value) {
    init_done.value = false;
    return;
  }
  if (containerWidth.value <= 0 || containerHeight.value <= 0) {
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
    hasPositioned.value = true;
    init_done.value = true;
    return;
  }

  // Re-open after toggle: keep last x/y (do not re-apply ModuleContainer anchors).
  if (hasPositioned.value) {
    applyClamp();
    init_done.value = true;
    return;
  }

  p_width.value = props.width || p_width.value || 200;
  p_height.value = props.height || p_height.value || 200;

  if (props.left != null) {
    p_x.value = props.left;
  }
  if (props.top != null) {
    p_y.value = props.top;
  }
  if (props.right != null) {
    p_x.value = containerWidth.value - props.right - p_width.value;
  }
  if (props.bottom != null) {
    p_y.value = containerHeight.value - props.bottom - p_height.value;
  }
  if (props.center || props.centerX) {
    p_x.value = (containerWidth.value - p_width.value) / 2;
  }
  if (props.center || props.centerY) {
    p_y.value = (containerHeight.value - p_height.value) / 2;
  }
  applyClamp();
  hasPositioned.value = true;
  emitBounds();
  init_done.value = true;
}
function onToggleExpanded() {
  if (expand.value && p_height.value > 50) {
    old_height.value = p_height.value;
  }
  expand.value = !expand.value;
  p_height.value = expand.value ? old_height.value : 50;
}
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <VueDraggableResizable
    v-if="show && init_done"
    :key="layoutKey"
    v-bind="$attrs"
    class="draggable-popup-wrapper"
    dragHandle=".drag"
    :parent="true"
    :handles="sticks"
    :w="p_width"
    :h="p_height"
    :x="p_x"
    :y="p_y"
    :z="zIndex"
    @resizing="onResize"
    @dragStop="onDragStop"
    @resizeStop="onResizeStop"
    :active="isActive"
    @activated="activateEv()"
    @deactivated="deactivateEv()"
    @dragging="onDragging"
  >
    <component
      :is="componentCard"
      :width="p_width"
      :height="p_height"
      :highlight="isHighlight"
    >
      <div
        ref="panelRoot"
        class="draggable-popup-desktop"
        role="dialog"
        :aria-labelledby="titleId"
        tabindex="-1"
      >
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
              <div class="draggable-popup-drag-container">
                <DragIcon :size="16" />
                <div class="drag grabbing"></div>
              </div>
            </template>
            <template #extra-btn>
              <slot name="extra-btn"></slot>
              <template v-if="isHasItems && !disabledOrder">
                <drag-button
                  aria-label="Send to back"
                  :disabled="isFirst"
                  @click="onToBack()"
                >
                  <ToBackIcon :size="16" />
                </drag-button>
                <drag-button
                  aria-label="Bring to front"
                  :disabled="isLast"
                  @click="onToFront()"
                >
                  <ToFrontIcon :size="16" />
                </drag-button>
              </template>
              <drag-button
                :aria-label="expand ? 'Collapse panel' : 'Expand panel'"
                :aria-expanded="expand ? 'true' : 'false'"
                @click="onToggleExpanded"
              >
                <ExpandedIcon v-if="expand" :size="16" />
                <CloseExpandedIcon v-else :size="16" />
              </drag-button>
              <drag-button
                v-if="!disabledClose"
                aria-label="Close panel"
                @click.stop="onClose"
              >
                <CloseIcon :size="16" />
              </drag-button>
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
