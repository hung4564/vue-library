<script lang="ts">
export default {
  name: 'DraggableItemSideBar',
};
</script>
<script setup lang="ts">
import ContextMenu from '../../ContextMenu.vue';
import ContextMenuItem from '../../ContextMenuItem.vue';
import { focusFirst, restoreFocus } from '@hungpvq/draggable';
import {
  computed,
  inject,
  nextTick,
  onBeforeUnmount,
  PropType,
  ref,
  Ref,
  watch,
} from 'vue';
import { type LocationSideBar } from '../../../types';
import {
  useComponent,
  useContainerSize,
  useIcon,
  withShareComponent,
} from '../../../hook';
import { useSideBarContainer } from '../../../hook/useSideBarContainer';
import { useDragComponent, useDragContainer, useSidebarItem } from '../../../store';
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
const menuOpen = ref(false);
const shellRoot = ref<HTMLElement>();
let previousFocus: HTMLElement | null = null;
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
const { getItemAction } = useDragContainer(containerId.value);
const ComponentMapSidebarToggle = computed(
  () => store.getComponentCardSidebarToggle() || MapSidebarToggle,
);
function onClose() {
  const itemShow = getShowForLocation(props.location);
  if (itemShow) {
    const action = getItemAction(itemShow);
    if (action?.close) {
      action.close();
      return;
    }
    storeDragItem.registerSideBarShow(itemShow, false);
  }
  show.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (!show.value || event.key !== 'Escape') return;
  if (menuOpen.value) return;
  const root = shellRoot.value;
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
    if (shellRoot.value) focusFirst(shellRoot.value);
  },
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
});

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
const activeSidebarId = computed(() => getShowForLocation(props.location));
const showSwitcher = computed(() => allItems.value.length > 1);
function openMenu(e: MouseEvent) {
  if (contextMenuRef.value) contextMenuRef.value.open(e);
}
function selectSideBar(nextId: string) {
  storeDragItem.registerSideBarShow(nextId, true);
  closeContextMenu();
}
</script>

<template>
  <div
    ref="shellRoot"
    class="sidebar-container auto-sidebar-container"
    role="complementary"
    :aria-label="`Sidebar ${location}`"
    :aria-labelledby="titleTo"
    tabindex="-1"
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
                v-if="showSwitcher"
                aria-label="Open sidebar menu"
                aria-haspopup="menu"
                :aria-expanded="menuOpen ? 'true' : 'false'"
              >
                <SidebarOpenMenu :size="16" />
              </map-button>
              <map-button @click="onClose" aria-label="Close sidebar">
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
        :aria-controls="contentTo"
        :aria-expanded="expand ? 'true' : 'false'"
        :aria-label="expand ? 'Collapse sidebar' : 'Expand sidebar'"
      ></ComponentMapSidebarToggle>
    </div>
  </div>
  <ContextMenu
    ref="contextMenuRef"
    aria-label="Switch sidebar panel"
    @update:open="menuOpen = $event"
  >
    <ul class="context-menu" role="presentation">
      <ContextMenuItem
        v-for="option in allItems"
        :key="option.id"
        :active="option.id === activeSidebarId"
        @click="selectSideBar(option.id)"
      >
        <span>{{ option.title }}</span>
      </ContextMenuItem>
    </ul>
  </ContextMenu>
</template>
