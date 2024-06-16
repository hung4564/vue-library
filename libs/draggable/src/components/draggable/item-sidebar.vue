<script lang="ts">
export default {
  name: 'DraggableItemSideBar',
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
const {
  CloseIcon,
  SidebarLeftExpandedIcon,
  SidebarLeftCloseExpandedIcon,
  SidebarRightExpandedIcon,
  SidebarRightCloseExpandedIcon,
  ToBackIcon,
  ToFrontIcon,
} = useIcon();
const props = defineProps({
  ...withShowProps,
  ...withExpandProps,
  ...withShareProps,
  width: { type: [Number, String], default: 'auto' },
  right: Boolean,
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
const isAutoWidth = computed(() => {
  return !props.width || props.width == 'auto';
});
const componentName = MapCard;
function onClose() {
  show.value = false;
}
const c_style = computed(() => {
  let style: StyleValue = {};
  style.zIndex = zIndex.value;
  if (props.width && props.width != 'auto') {
    if (props.width && !isNaN(+props.width)) style.width = props.width + 'px';
    else {
      style.width = props.width;
    }
  }
  return style;
});
</script>

<template>
  <div
    class="sidebar-container"
    v-if="show"
    :class="{
      expand: expand,
      'left-sidebar-container': !right,
      'right-sidebar-container': right,
      'auto-sidebar-container': isAutoWidth,
    }"
    :style="c_style"
  >
    <div class="sidebar-container--content">
      <component :is="componentName" width="100%" height="100%">
        <div class="draggable-sidebar">
          <template v-if="!disabledHeader">
            <div class="draggable-sidebar-heading">
              <div class="draggable-sidebar-heading__content">
                <div class="draggable-sidebar-heading__title">
                  <slot name="title">
                    {{ title }}
                  </slot>
                </div>
                <div class="map-spacer"></div>
                <slot name="extra-btn"></slot>

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
              </div>
            </div>
            <hr class="map-divider" />
          </template>
          <div class="draggable-sidebar-content">
            <slot></slot>
          </div>
        </div>
      </component>
    </div>
    <div class="complex-button-close" v-if="show && !disabledExpand">
      <button @click="onToggleExpand">
        <span v-if="!right">
          <SidebarLeftExpandedIcon v-if="expand" :size="16" />
          <SidebarLeftCloseExpandedIcon v-else :size="16" />
        </span>
        <span v-else>
          <SidebarRightExpandedIcon v-if="expand" :size="16" />
          <SidebarRightCloseExpandedIcon v-else :size="16" />
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.draggable-sidebar .map-spacer {
  flex-grow: 1;
}

.draggable-sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.draggable-sidebar-heading {
  flex-grow: 0;
  contain: layout;
  display: block;
  max-width: 100%;
}

.draggable-sidebar-heading__content {
  padding: 0 4px 0 8px;
  align-items: center;
  display: flex;
  position: relative;
  z-index: 0;
  flex: 1 1 auto;
}

.draggable-sidebar-heading__content .drag {
  margin: 4px;
}

.draggable-sidebar-heading,
.draggable-sidebar-heading__content {
  height: 48px;
}

.draggable-sidebar-heading :deep(.map-control-button) {
  background-color: unset;
}

.draggable-sidebar-heading__title {
  font-size: 1.25rem;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.draggable-sidebar-content {
  flex-grow: 1;
  overflow: auto;
}
</style>

<style scoped lang="scss">
.sidebar-container {
  position: absolute;
  pointer-events: all;
  z-index: 900;
  top: 0;
  height: 100%;
  transition: max-width 1s;
}

.sidebar-container > .sidebar-container--content {
  display: none;
  height: 100%;
  width: 100%;
}

.sidebar-container.expand > .sidebar-container--content {
  display: block;
}

.sidebar-container {
  transition: all 0.2s ease;
}

.complex-button-close {
  position: absolute;
  top: 50%;
}

.left-sidebar-container {
  left: 0;
}

.right-sidebar-container {
  right: 0;
}

.sidebar-container {
  width: 0;
}

.complex-button-close > button {
  height: 48px;
  width: 23px;
  display: flex;
  background-color: rgba(32, 43, 54, 0.9);
  color: white;
  align-items: center;
  border-radius: 0px;
  border: none;
}

.complex-button-close > button:focus:not(:focus-visible) {
  outline: 0;
}
</style>

<style scoped lang="scss">
@media only screen and (max-width: 600px) {
  .auto-sidebar-container {
    width: 100%;
  }
}

@media only screen and (min-width: 600px) and (max-width: 1264px) {
  .auto-sidebar-container.expand {
    width: 320px;
  }

  .auto-sidebar-container.expand.left-sidebar-container .complex-button-close {
    left: 320px !important;
  }

  .auto-sidebar-container.expand.right-sidebar-container .complex-button-close {
    right: 320px !important;
  }
}

@media only screen and (min-width: 1264px) {
  .auto-sidebar-container.expand {
    width: 400px;
  }

  .auto-sidebar-container.expand.left-sidebar-container .complex-button-close {
    left: 400px !important;
  }

  .auto-sidebar-container.expand.right-sidebar-container .complex-button-close {
    right: 400px !important;
  }
}

.sidebar-container {
  position: absolute;
  pointer-events: all;
  z-index: 900;
  top: 0;
  transition: max-width 1s;
}

.sidebar-container {
  transition: all 0.2s ease;
}

.complex-button-close {
  position: absolute;
  top: 50%;
  transition: max-width 1s;
  transition: all 0.2s ease;
}

.left-sidebar-container {
  left: 0;
}

.right-sidebar-container {
  right: 0;
}

.sidebar-container {
  width: 0;
}
</style>

<style lang="scss" scoped>
.sidebar-container {
  &.left-sidebar-container {
    .complex-button-close {
      left: 0;
      transform: translateY(-50%);
    }
  }

  &.right-sidebar-container {
    .complex-button-close {
      right: 0;
      transform: translateY(-50%);
    }
  }
}
.draggable-sidebar-heading {
  button {
    color: #fff;
  }
}
</style>
