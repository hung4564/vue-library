import { getUUIDv4 } from '@hungpvq/shared';
import { Ref, onMounted, onUnmounted, ref, watch } from 'vue';
import { useBottomItem } from '../store';

export function useInitBottom(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: {
    title?: string;
    type: 'item-bottom';
  } = { type: 'item-bottom' },
  stableId?: string,
) {
  const itemId = ref(stableId || `draggable-item-${getUUIDv4()}`);
  const zIndex = ref(0);
  function setZIndex(value: number) {
    zIndex.value = value;
  }
  function setShow(value: boolean) {
    show.value = value;
  }
  const store = useBottomItem(containerId);

  onMounted(() => {
    store.registerBottom(itemId.value);
    store.registerAction(itemId.value, {
      title: optionDefault.title,
      type: optionDefault.type,
      setZIndex,
      setShow,
    });
    if (show.value) {
      store.registerBottomShow(itemId.value, true);
    }
  });
  onUnmounted(() => {
    store.unRegisterBottom(itemId.value);
  });
  watch(show, (value) => {
    if (value) {
      store.registerBottomShow(itemId.value, true);
      return;
    }
    try {
      if (store.getShow() === itemId.value) {
        store.registerBottomShow(itemId.value, false);
      }
    } catch {
      // container may already be gone during unmount
    }
  });
  return { itemId, zIndex };
}
