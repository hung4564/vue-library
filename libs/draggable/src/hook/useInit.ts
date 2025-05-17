import { getUUIDv4 } from '@hungpvq/shared';
import { Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDragStore } from '../store';
import { checkIsFirst, checkIsLast } from '../utils/array';

export function useInit(containerId: string, show: Ref<boolean>, id?: string) {
  const itemId = ref(id || `draggable-item-${getUUIDv4()}`);
  const zIndex = ref(0);
  function setZIndex(value: number) {
    zIndex.value = value;
  }
  const store = useDragStore(containerId);
  onMounted(() => {
    store.actions.registerItem(itemId.value);
    store.actions.registerAction(itemId.value, {
      setZIndex,
    });
    if (show.value) {
      store.actions.registerItemShow(itemId.value, show.value);
    }
  });
  onUnmounted(() => {
    store.actions.unRegisterItem(itemId.value);
  });
  watch(show, (value) => {
    store.actions.registerItemShow(itemId.value, value);
  });
  return { itemId, zIndex };
}
export function useContainerOrder(containerId: string, itemId: string) {
  const store = useDragStore(containerId);
  const items = computed(() => store.getters.getItems());
  const itemShows = computed(() => store.getters.getItemsShow());
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
    store.actions.setToBack(itemId);
  }
  function onToFront() {
    store.actions.setToFront(itemId);
  }
  return { items, itemShows, isLast, isFirst, isHasItems, onToBack, onToFront };
}

export function useContainerSize(containerId: string) {
  const store = useDragStore(containerId);
  const containerWidth = computed(() => store.getters.getWidth());
  const containerHeight = computed(() => store.getters.getHeight());
  return { containerWidth, containerHeight };
}
