import { getUUIDv4 } from '@hungpvq/shared';
import {
  Ref,
  markRaw,
  onMounted,
  onUnmounted,
  ref,
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue';
import { useBottomItem, useDragItem } from '../store';

function rawCard(component: unknown) {
  if (component && typeof component === 'object') {
    return markRaw(component);
  }
  return component;
}

export function useInitBottom(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: {
    title?: string;
    type: 'item-bottom';
    componentCard?: unknown;
    componentCardHeader?: unknown;
  } = { type: 'item-bottom' },
  stableId?: string,
  /** Live local card overrides (re-registered when they change). */
  componentCards?: MaybeRefOrGetter<{
    componentCard?: unknown;
    componentCardHeader?: unknown;
  }>,
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
  const dragItems = useDragItem(containerId);

  onMounted(() => {
    const cards = componentCards ? toValue(componentCards) : undefined;
    store.registerBottom(itemId.value);
    store.registerAction(itemId.value, {
      title: optionDefault.title,
      type: optionDefault.type,
      setZIndex,
      setShow,
      componentCard: rawCard(
        cards?.componentCard ?? optionDefault.componentCard,
      ),
      componentCardHeader: rawCard(
        cards?.componentCardHeader ?? optionDefault.componentCardHeader,
      ),
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
  if (componentCards) {
    watch(
      () => toValue(componentCards),
      (cards) => {
        dragItems.registerOtherAction(itemId.value, {
          componentCard: rawCard(cards?.componentCard),
          componentCardHeader: rawCard(cards?.componentCardHeader),
        });
      },
      { deep: true },
    );
  }
  return { itemId, zIndex };
}
