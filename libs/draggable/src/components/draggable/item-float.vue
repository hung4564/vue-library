<script lang="ts">
export default {
  name: 'DraggableItemFloat',
};
</script>
<script setup lang="ts">
import { computed, inject, ref, Ref, StyleValue } from 'vue';
import {
  useComponent,
  useContainerOrder,
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
  ref(props.containerId || '')
);
if (!containerId.value) {
  throw 'Not set container id';
}
const { show } = useShow(props, emit);
const { zIndex, itemId } = useInit(containerId.value, show);
const { isLast, isFirst, isHasItems, onToBack, onToFront } = useContainerOrder(
  containerId.value,
  itemId.value
);
const { expand, toggle: onToggleExpand } = useExpand(props, emit, true);
const { componentCard, componentCardHeader } = useComponent({
  ...props,
  containerId: containerId.value,
});
function onClose() {
  show.value = false;
}
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
    class="float-container"
    v-if="show"
    :class="{
      'auto-float-container': isAutoWidth,
    }"
    :style="c_style"
  >
    <component :is="componentCard">
      <div class="draggable-float">
        <template v-if="!disabledHeader && headerLocation === 'top'">
          <component :is="componentCardHeader">
            <template #title>
              <slot name="title">
                {{ title }}
              </slot>
            </template>

            <template #extra-btn>
              <slot name="extra-btn"></slot>

              <map-button @click="onToggleExpand">
                <ExpandedIcon v-if="expand" :size="16" />
                <CloseExpandedIcon v-else :size="16" />
              </map-button>
              <template v-if="isHasItems && !disabledOrder">
                <map-button :disabled="isFirst" @click="onToBack()">
                  <ToBackIcon :size="16" />
                </map-button>
                <map-button :disabled="isLast" @click="onToFront()">
                  <ToFrontIcon :size="16" />
                </map-button>
              </template>
              <map-button v-if="!disabledClose" @click="onClose">
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
              <slot name="title">
                {{ title }}
              </slot>
            </template>

            <template #extra-btn>
              <slot name="extra-btn"></slot>
              <map-button @click="onToggleExpand">
                <ExpandedIcon v-if="expand" :size="16" />
                <CloseExpandedIcon v-else :size="16" />
              </map-button>
              <template v-if="isHasItems && !disabledOrder">
                <map-button :disabled="isFirst" @click="onToBack()">
                  <ToBackIcon :size="16" />
                </map-button>
                <map-button :disabled="isLast" @click="onToFront()">
                  <ToFrontIcon :size="16" />
                </map-button>
              </template>
              <map-button v-if="!disabledClose" @click="onClose">
                <CloseIcon :size="16" />
              </map-button>
            </template>
          </component>
        </template>
      </div>
    </component>
  </div>
</template>

<style scoped>
.draggable-float .map-divider {
  flex-grow: 0;
}

.draggable-float .map-spacer {
  flex-grow: 1;
}

.draggable-float {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.draggable-float-content {
  flex-grow: 1;
  overflow: auto;
}
</style>

<style scoped lang="scss">
.float-container {
  position: absolute;
  pointer-events: all;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.float-container > .float-container--content {
  display: none;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.float-container > .float-container--content {
  display: block;
}

.float-container {
  transition: all 0.2s ease;
}
</style>

<style scoped lang="scss">
@media only screen and (max-width: 600px) {
  .auto-float-container {
    width: 100%;
  }
}

@media only screen and (min-width: 600px) and (max-width: 1264px) {
  .auto-float-container {
    width: 320px;
  }
}

@media only screen and (min-width: 1264px) {
  .auto-float-container {
    width: 400px;
  }
}
</style>
