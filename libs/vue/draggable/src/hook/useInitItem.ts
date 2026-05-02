import { getUUIDv4 } from '@hungpvq/shared';
import { Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDragContainer, useDragItem, useDragStore } from '../store';
import { InitOption } from '../types';
import { checkIsFirst, checkIsLast } from '../utils/array';

export function useInitItem(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: InitOption = {
    type: 'draggable-item',
  },
) {
  const itemId = ref(`draggable-item-${getUUIDv4()}`);
  const zIndex = ref(10);
  function setZIndex(value: number) {
    zIndex.value = value;
  }
  function setShow(value: boolean) {
    show.value = value;
  }
  const store = useDragItem(containerId);
  onMounted(() => {
    store.registerItem(itemId.value);
    store.registerAction(itemId.value, {
      ...optionDefault,
      setZIndex,
      setShow,
    });
    if (show.value) {
      store.registerItemShow(itemId.value, show.value);
    }
  });
  onUnmounted(() => {
    store.unRegisterItem(itemId.value);
  });
  watch(show, (value) => {
    store.registerItemShow(itemId.value, value);
  });
  return { itemId, zIndex };
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

export function useManagement(containerId: string) {
  const store = useDragStore();
  const container = store.container[containerId];
  const items = computed(() => container.items);
  const itemShows = computed(() => container.show);
  const sideBar = computed(() => container.sideBar);
  const width = computed(() => container.width);
  const height = computed(() => container.height);
  return { containerId, items, itemShows, sideBar, width, height };
}
