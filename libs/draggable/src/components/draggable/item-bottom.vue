<script lang="ts">
export default {
  name: 'DraggableItemBottom',
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
const { CloseIcon, ToBackIcon, FullscreenIcon, OffFullscreenIcon } = useIcon();
const props = defineProps({
  ...withShowProps,
  ...withExpandProps,
  ...withShareProps,
});
const emit = defineEmits({ ...withShowEmit, ...withExpandEmit });
const containerId = inject<Ref<string>>(
  'containerId',
  ref(props.containerId || ''),
);
if (!containerId.value) {
  throw 'Not set container id';
}
const { show } = useShow(props, emit);
const { zIndex, itemId } = useInit(containerId.value, show, {
  title: props.title,
  type: 'item-bottom',
});
const { isFirst, isHasItems, onToBack } = useContainerOrder(
  containerId.value,
  itemId.value,
);
const { expand, toggle: onToggleExpand } = useExpand(props, emit, false);
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
  style.height = expand.value ? '100%' : '45%';
  return style;
});
</script>
<template>
  <div v-if="show" class="popup-mobile-container" :style="c_style">
    <component :is="componentCard">
      <div class="draggable-bottom">
        <template v-if="!disabledHeader">
          <component :is="componentCardHeader">
            <template #title>
              <slot name="title">
                {{ title }}
              </slot>
            </template>
            <template #extra-btn>
              <slot name="extra-btn"></slot>
              <template v-if="isHasItems && !disabledOrder">
                <map-button
                  :disabled="isFirst"
                  @click.prevent.stop="onToBack()"
                >
                  <ToBackIcon :size="16" />
                </map-button>
              </template>
              <map-button @click="onToggleExpand()">
                <FullscreenIcon :size="16" v-if="expand" />
                <OffFullscreenIcon :size="16" v-else />
              </map-button>
              <map-button v-if="!disabledClose" @click="onClose">
                <CloseIcon :size="16" />
              </map-button>
            </template>
          </component>
        </template>
        <div class="draggable-bottom-content">
          <slot></slot>
        </div>
      </div>
    </component>
  </div>
</template>

<style scoped>
.draggable-bottom .map-divider {
  flex-grow: 0;
}

.popup-mobile-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.draggable-bottom {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.draggable-bottom-content {
  flex-grow: 1;
  overflow: auto;
}
</style>
