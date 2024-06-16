import { getUUIDv4 } from '@hungpv97/shared';
import { Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import {
  register,
  registerAction,
  registerItemShow,
  setToBack,
  setToFront,
  unRegister,
} from '../store';
import { store } from '../store/store';
import { checkIsFirst, checkIsLast } from '../utils/array';

export function useInit(containerId: string, show: Ref<boolean>, id?: string) {
  const itemId = ref(id || `draggable-item-${getUUIDv4()}`);
  const zIndex = ref(0);
  function setZIndex(value: number) {
    zIndex.value = value;
  }
  onMounted(() => {
    register(containerId, itemId.value);
    registerAction(containerId, itemId.value, {
      setZIndex,
    });
    if (show.value) {
      registerItemShow(containerId, itemId.value, show.value);
    }
  });
  onUnmounted(() => {
    unRegister(containerId, itemId.value);
  });
  watch(show, (value) => {
    registerItemShow(containerId, itemId.value, value);
  });
  return { itemId, zIndex };
}
export function useContainerOrder(containerId: string, itemId: string) {
  const items = computed(() => store.getters.getItems(containerId));
  const itemShows = computed(() => store.getters.getItemsShow(containerId));
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
    setToBack(containerId, itemId);
  }
  function onToFront() {
    setToFront(containerId, itemId);
  }
  return { items, itemShows, isLast, isFirst, isHasItems, onToBack, onToFront };
}

export function useContainerSize(containerId: string) {
  const containerWidth = computed(() => store.getters.getWidth(containerId));
  const containerHeight = computed(() => store.getters.getHeight(containerId));
  return { containerWidth, containerHeight };
}
