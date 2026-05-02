import { getUUIDv4 } from '@hungpvq/shared';
import { Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDragContainer, useDragItem, useSidebarItem } from '../store';
import { LocationSideBar } from '../types';
import { checkIsFirst, checkIsLast } from '../utils/array';

export function useInitSidebar(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: {
    title?: string;
    type: 'item-sidebar';
    location: LocationSideBar;
  },
) {
  const itemId = ref(`draggable-item-${getUUIDv4()}`);
  const zIndex = ref(0);
  function setZIndex(value: number) {
    zIndex.value = value;
  }
  function setShow(value: boolean) {
    show.value = value;
  }
  const store = useSidebarItem(containerId);
  onMounted(() => {
    store.registerSideBar(itemId.value, optionDefault.location);
    store.registerAction(itemId.value, {
      ...optionDefault,
      setZIndex,
      setShow,
    });
    if (show.value) {
      store.registerSideBarShow(itemId.value, show.value);
    }
  });
  onUnmounted(() => {
    store.unRegisterSideBar(itemId.value);
  });
  watch(show, (value) => {
    if (value) store.registerSideBarShow(itemId.value, value);
  });
  const location = computed(() => {
    return optionDefault.location;
  });
  return { itemId, zIndex, location };
}
export function useContainerOrder(containerId: string, itemId: string) {
  const store = useDragItem(containerId);
  const items = computed(() => store.getItems());
  const itemShows = computed(() => store.getItemsShow());
  const isLast = computed(() => {
    return checkIsLast(itemId, itemShows.value);
  });
  const isFirst = computed(() => {
    return checkIsFirst(itemId, itemShows.value);
  });
  const isHasItems = computed(() => {
    return itemShows.value.length > 1;
  });
  function onToBack() {
    store.setToBack(itemId);
  }
  function onToFront() {
    store.setToFront(itemId);
  }
  return { items, itemShows, isLast, isFirst, isHasItems, onToBack, onToFront };
}

export function useContainerSize(containerId: string) {
  const store = useDragContainer(containerId);
  const containerWidth = computed(() => store.getWidth());
  const containerHeight = computed(() => store.getHeight());
  return { containerWidth, containerHeight };
}
