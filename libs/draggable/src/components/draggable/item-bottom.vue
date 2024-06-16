<script lang="ts">
export default {
  name: 'DraggableItemBottom',
};
</script>
<script setup lang="ts">
import { computed, inject, ref, Ref, StyleValue } from 'vue';
import MapCard from '../MapCard.vue';
import MapButton from '../MapButton.vue';
import {
  useInit,
  useExpand,
  useShow,
  withExpandEmit,
  withExpandProps,
  withShowEmit,
  withShowProps,
  withShareProps,
  useIcon,
  useContainerOrder,
} from '../../hook';
const { CloseIcon, ToBackIcon, FullscreenIcon, OffFullscreenIcon } = useIcon();
const props = defineProps({
  ...withShowProps,
  ...withExpandProps,
  ...withShareProps,
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
const { isFirst, isHasItems, onToBack } = useContainerOrder(
  containerId.value,
  itemId.value
);
const { expand, toggle: onToggleExpand } = useExpand(props, emit, false);
const componentName = MapCard;
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
    <component :is="componentName">
      <div class="draggable-bottom">
        <template v-if="!disabledHeader">
          <div class="draggable-bottom-heading">
            <div class="draggable-bottom-heading__title">
              <slot name="title">
                {{ title }}
              </slot>
            </div>
            <div class="draggable-bottom-heading__content"></div>
            <div class="map-spacer"></div>
            <slot name="extra-btn"></slot>

            <template v-if="isHasItems && !disabledOrder">
              <map-button :disabled="isFirst" @click.prevent.stop="onToBack()">
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
          </div>

          <hr class="map-divider" />
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

.draggable-bottom-heading {
  align-items: center;
  display: flex;
  position: relative;
  z-index: 0;
  flex-grow: 0;
  max-width: 100%;
  padding: 0 8px;
}

.draggable-bottom-heading__content {
  contain: layout;
  display: block;
  flex: 1 1 auto;
}

.draggable-bottom-heading,
.draggable-bottom-heading__content {
  height: 48px;
}

.draggable-bottom-heading :deep(.map-control-button) {
  background-color: unset;
}

.draggable-bottom-heading__title {
  font-size: 1.25rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draggable-bottom-content {
  flex-grow: 1;
  overflow: auto;
}
</style>
