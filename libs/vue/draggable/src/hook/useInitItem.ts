import { checkIsFirst, checkIsLast, itemTypeToGroup } from '@hungpvq/draggable';
import { getUUIDv4 } from '@hungpvq/shared';
import { Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDragContainer, useDragItem, useDragStore } from '../store';
import { InitOption } from '../types';

export function useInitItem(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: InitOption = {
    type: 'item-popup',
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
    store.registerItem(itemId.value, optionDefault.type);
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
  const dragStore = useDragStore();
  const group = computed(() =>
    itemTypeToGroup(dragStore.container[containerId]?.actions?.[itemId]?.type),
  );
  const items = computed(() => store.getItems(group.value));
  const itemShows = computed(() => store.getItemsShow(group.value));
  const isLast = computed(() => {
    return checkIsLast(itemId, itemShows.value);
  });
  const isFirst = computed(() => {
    return checkIsFirst(itemId, itemShows.value);
  });
  const isHasItems = computed(() => {
    return itemShows.value.length > 1;
  });
  /** All registered items in this group (for mobile/desktop switcher menus). */
  const switchItems = computed(() => {
    const actions = dragStore.container[containerId]?.actions || {};
    return items.value.map((id) => ({
      id,
      title: actions[id]?.title || id,
      active: id === itemId,
    }));
  });
  function onToBack() {
    store.setToBack(itemId);
  }
  function onToFront() {
    store.setToFront(itemId);
  }
  function selectItem(id: string) {
    const action = dragStore.container[containerId]?.actions?.[id];
    action?.setShow?.(true);
    store.setToFront(id);
  }
  return {
    items,
    itemShows,
    switchItems,
    isLast,
    isFirst,
    isHasItems,
    onToBack,
    onToFront,
    selectItem,
  };
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
  const popup = computed(() => container?.popup || { items: [], show: [] });
  const modal = computed(() => container?.modal || { items: [], show: [] });
  const float = computed(() => container?.float || { items: [], show: [] });
  const bottom = computed(() => container?.bottom || { items: [], show: [] });
  const sideBar = computed(() => container?.sideBar);
  const drawer = computed(() => container?.drawer);
  const width = computed(() => container?.width || 0);
  const height = computed(() => container?.height || 0);
  return {
    containerId,
    popup,
    modal,
    float,
    bottom,
    sideBar,
    drawer,
    width,
    height,
  };
}
