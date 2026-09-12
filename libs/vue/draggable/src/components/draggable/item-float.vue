<script lang="ts">
export default {
  name: 'DraggableItemFloat',
};
</script>
<script setup lang="ts">
import { computed, inject, nextTick, onBeforeUnmount, ref, Ref, StyleValue, watch } from 'vue';
import { focusFirst, restoreFocus } from '@hungpvq/draggable';
import {
  useComponent,
  useContainerOrder,
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
import MapButton from '../parts/MapButton.vue';
const { CloseIcon, ToBackIcon, ToFrontIcon, ExpandedIcon, CloseExpandedIcon } =
  useIcon();
const props = defineProps({
  ...withShowProps,
  ...withExpandProps,
  ...withShareProps,
  top: { type: Number, default: undefined },
  left: { type: Number, default: undefined },
  bottom: { type: Number, default: undefined },
  right: { type: Number, default: undefined },
  width: { type: [Number, String], default: 'auto' },
  maxHeight: { type: Number, default: 500 },
  headerLocation: {
    type: String,
    default: 'top',
    validator: function (value: string) {
      // The value must match one of these strings
      return ['top', 'bottom'].includes(value);
    },
  },
});
const emit = defineEmits({ ...withShowEmit, ...withExpandEmit });
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
    type: 'item-float',
  },
  props.id,
);
const { isHighlight, setHighLight } = useHighlight(props.highlightMs);
useInitAction(containerId.value, itemId.value, {
  setHighLight,
  open,
  close,
});
const { isLast, isFirst, isHasItems, onToBack, onToFront } = useContainerOrder(
  containerId.value,
  itemId.value,
);
const { expand, toggle: onToggleExpand } = useExpand(props, emit, true);
const { componentCard, componentCardHeader } = useComponent({
  ...props,
  containerId: containerId.value,
});
const panelRoot = ref<HTMLElement>();
const titleId = `float-title-${itemId.value}`;
let previousFocus: HTMLElement | null = null;

function onClose() {
  close();
}

function onKeydown(event: KeyboardEvent) {
  if (!show.value || event.key !== 'Escape') return;
  const root = panelRoot.value;
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
    if (panelRoot.value) focusFirst(panelRoot.value);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});
const c_style = computed(() => {
  let style: StyleValue = {};
  style.zIndex = zIndex.value;
  if (props.top) {
    style.top = props.top + 'px';
  }
  if (props.left) {
    style.left = props.left + 'px';
  }
  if (props.right) {
    style.right = props.right + 'px';
  }
  if (props.bottom) {
    style.bottom = props.bottom + 'px';
  }
  if (props.width && props.width != 'auto') {
    if (props.width && !isNaN(+props.width)) style.width = props.width + 'px';
    else {
      style.width = props.width;
    }
  }
  return style;
});
const c_styleContent = computed(() => {
  let style: StyleValue = {};
  style.maxHeight = props.maxHeight + 'px';
  return style;
});
const isAutoWidth = computed(() => {
  return !props.width || props.width == 'auto';
});
</script>

<template>
  <div
    ref="panelRoot"
    class="float-container"
    v-if="show"
    role="dialog"
    :aria-labelledby="titleId"
    tabindex="-1"
    :class="{
      'auto-float-container': isAutoWidth,
    }"
    :style="c_style"
  >
    <component :is="componentCard" :highlight="isHighlight">
      <div class="draggable-float">
        <template v-if="!disabledHeader && headerLocation === 'top'">
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

              <map-button
                :aria-label="expand ? 'Collapse panel' : 'Expand panel'"
                :aria-expanded="expand ? 'true' : 'false'"
                @click="onToggleExpand"
              >
                <ExpandedIcon v-if="expand" :size="16" />
                <CloseExpandedIcon v-else :size="16" />
              </map-button>
              <template v-if="isHasItems && !disabledOrder">
                <map-button
                  aria-label="Send to back"
                  :disabled="isFirst"
                  @click="onToBack()"
                >
                  <ToBackIcon :size="16" />
                </map-button>
                <map-button
                  aria-label="Bring to front"
                  :disabled="isLast"
                  @click="onToFront()"
                >
                  <ToFrontIcon :size="16" />
                </map-button>
              </template>
              <map-button
                v-if="!disabledClose"
                aria-label="Close panel"
                @click="onClose"
              >
                <CloseIcon :size="16" />
              </map-button>
            </template>
          </component>
        </template>
        <div
          class="draggable-float-content"
          v-show="expand"
          :style="c_styleContent"
        >
          <slot></slot>
        </div>
        <template v-if="!disabledHeader && headerLocation === 'bottom'">
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
              <map-button
                :aria-label="expand ? 'Collapse panel' : 'Expand panel'"
                :aria-expanded="expand ? 'true' : 'false'"
                @click="onToggleExpand"
              >
                <ExpandedIcon v-if="expand" :size="16" />
                <CloseExpandedIcon v-else :size="16" />
              </map-button>
              <template v-if="isHasItems && !disabledOrder">
                <map-button
                  aria-label="Send to back"
                  :disabled="isFirst"
                  @click="onToBack()"
                >
                  <ToBackIcon :size="16" />
                </map-button>
                <map-button
                  aria-label="Bring to front"
                  :disabled="isLast"
                  @click="onToFront()"
                >
                  <ToFrontIcon :size="16" />
                </map-button>
              </template>
              <map-button
                v-if="!disabledClose"
                aria-label="Close panel"
                @click="onClose"
              >
                <CloseIcon :size="16" />
              </map-button>
            </template>
          </component>
        </template>
      </div>
    </component>
  </div>
</template>
