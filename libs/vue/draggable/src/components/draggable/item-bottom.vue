<script lang="ts">
export default {
  name: 'DraggableItemBottom',
  // Mobile stand-in for popup/float/modal/drawer/sidebar — ignore their extra attrs
  // (location, size, …) instead of falling through a fragment root.
  inheritAttrs: false,
};
</script>
<script setup lang="ts">
import ContextMenu from '../ContextMenu.vue';
import { computed, inject, ref, Ref, StyleValue } from 'vue';
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

const { CloseIcon, SidebarOpenMenu, FullscreenIcon, OffFullscreenIcon } =
  useIcon();
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
const { show, open, close } = useShow(props, emit);
const { zIndex, itemId } = useInitItem(containerId.value, show, {
  title: props.title,
  type: 'item-bottom',
});
const { isHighlight, setHighLight } = useHighlight();
useInitAction(containerId.value, itemId.value, {
  setHighLight,
  open,
  close,
});
const { switchItems, selectItem } = useContainerOrder(
  containerId.value,
  itemId.value,
);
const { expand, toggle: onToggleExpand } = useExpand(props, emit, false);
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

function onClose() {
  show.value = false;
}
function openMenu(e: MouseEvent) {
  contextMenuRef.value?.open(e);
}
function closeContextMenu() {
  contextMenuRef.value?.close();
}
function onSelectItem(id: string) {
  selectItem(id);
  closeContextMenu();
}

const showSwitcher = computed(
  () => !props.disabledOrder && switchItems.value.length > 1,
);

const c_style = computed(() => {
  let style: StyleValue = {};
  style.zIndex = zIndex.value;
  style.height = expand.value ? '100%' : '45%';
  return style;
});
</script>
<template>
  <div v-if="show" class="popup-mobile-container" :style="c_style">
    <component :is="componentCard" :highlight="isHighlight">
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
              <map-button
                v-if="showSwitcher"
                aria-label="Open item menu"
                role="button"
                @click="openMenu"
              >
                <SidebarOpenMenu :size="16" />
              </map-button>
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
  <ContextMenu ref="contextMenuRef">
    <ul class="context-menu">
      <li
        v-for="option in switchItems"
        :key="option.id"
        class="context-menu__item clickable"
        :class="{ 'is-active': option.active }"
        @click.stop="onSelectItem(option.id)"
      >
        <span v-html="option.title"></span>
      </li>
    </ul>
  </ContextMenu>
</template>
