<script lang="ts">
export default {
  name: 'DraggableItemSideBar',
};
</script>
<script setup lang="ts">
import { ContextMenu } from '@hungpvq/vue-content-menu';
import { computed, inject, PropType, ref, Ref, watch } from 'vue';
import { type LocationSideBar } from '../../..//types';
import {
  useComponent,
  useContainerSize,
  useIcon,
  withShareComponent,
} from '../../../hook';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import { useDragComponent, useSidebarItem } from '../../../store';
import MapButton from '../../parts/MapButton.vue';
import MapSidebarToggle from '../../parts/MapSidebarToggle.vue';
import { useSidebarBehavior } from './useSidebarBehavior';
const contextMenuRef = ref<
  | {
      open(event: MouseEvent): void;
      close(): void;
    }
  | undefined
>();
const { CloseIcon, SidebarOpenMenu } = useIcon();
const props = defineProps({
  ...withShareComponent,
  location: {
    type: String as PropType<LocationSideBar>,
    default: 'left',
  },
});
const store = useDragComponent();
const containerId = inject<Ref<string>>('containerId');
if (!containerId || !containerId.value) {
  throw new Error('[DraggableItemSideBar] Missing containerId');
}
const { containerWidth, containerHeight } = useContainerSize(containerId.value);
const sidebarWidth = computed(() => {
  if (containerWidth.value <= 600) return '100%';
  if (containerWidth.value <= 1264) return '320px';
  return '400px';
});
const sidebarHeight = computed(() => {
  const h = containerHeight.value;
  if (h <= 400) return '100%'; // Thiết bị rất nhỏ
  if (h <= 800) return '40%'; // Điện thoại dọc
  if (h <= 1080) return '320px'; // Laptop/FHD màn hình nhỏ
  return '400px'; // Desktop, màn lớn
});
const { getShowForLocation, getItemsForLocation } = useSideBarContainer(
  containerId.value,
);
const {
  show,
  expand,
  toggleExpand: onToggleExpand,
  isVertical,
  titleTo,
  contentTo,
} = useSidebarBehavior(props, containerId);
const { componentCard, componentCardHeader } = useComponent({
  ...props,
  containerId: containerId.value,
});
const storeDragItem = useSidebarItem(containerId.value);
const ComponentMapSidebarToggle = computed(
  () => store.getComponentCardSidebarToggle() || MapSidebarToggle,
);
function onClose() {
  show.value = false;
  const itemShow = getShowForLocation(props.location);
  if (itemShow) storeDragItem.registerSideBarShow(itemShow, false);
}
const c_getShowForLocation = computed(() => getShowForLocation(props.location));
watch(
  c_getShowForLocation,
  (newValue) => {
    show.value = !!newValue;
  },
  { immediate: true },
);
function closeContextMenu() {
  if (contextMenuRef.value) contextMenuRef.value.close();
}
const allItems = computed(() => getItemsForLocation(props.location));
const availableSidebarItems = computed(() =>
  allItems.value.filter((x) => x.id !== getShowForLocation(props.location)),
);
function openMenu(e: MouseEvent) {
  if (contextMenuRef.value) contextMenuRef.value.open(e);
}
function selectSideBar(itemId: string) {
  storeDragItem.registerSideBarShow(itemId, true);
}
</script>

<template>
  <div
    class="sidebar-container auto-sidebar-container"
    :class="{
      expand,
      show,
      'sidebar-horizontal-container': !isVertical,
      'sidebar-vertical-container': isVertical,
      [`${location}-sidebar-container`]: !!location,
    }"
    :style="{
      '--sidebar-width': sidebarWidth,
      '--sidebar-height': sidebarHeight,
    }"
  >
    <div class="sidebar-container--content">
      <component :is="componentCard" width="100%" height="100%">
        <div class="draggable-sidebar">
          <component :is="componentCardHeader">
            <template #title>
              <div name="title">
                <span :id="titleTo"> </span>
              </div>
            </template>
            <template #extra-btn>
              <slot name="extra-btn"></slot>
              <map-button
                @click="openMenu"
                v-if="availableSidebarItems.length > 0"
                aria-label="Open sidebar menu"
                role="button"
              >
                <SidebarOpenMenu :size="16" />
              </map-button>
              <map-button
                @click="onClose"
                aria-label="Close sidebar"
                role="button"
              >
                <CloseIcon :size="16" />
              </map-button>
            </template>
          </component>
          <div class="draggable-sidebar-content" :id="contentTo">
            <slot name="default"></slot>
          </div>
        </div>
      </component>
    </div>
    <div class="complex-button-close" v-if="show">
      <ComponentMapSidebarToggle
        @click="onToggleExpand"
        :expand="expand"
        aria-controls="contentTo"
        aria-label="Toggle expand"
        role="button"
      ></ComponentMapSidebarToggle>
    </div>
  </div>
  <ContextMenu ref="contextMenuRef">
    <ul class="context-menu">
      <li
        v-for="(option, index) in availableSidebarItems"
        :key="index"
        @click.stop="
          selectSideBar(option.id);
          closeContextMenu();
        "
        class="context-menu__item clickable"
      >
        <span v-html="option.title"></span>
      </li>
    </ul>
  </ContextMenu>
</template>
