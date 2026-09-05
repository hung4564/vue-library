import { getUUIDv4 } from '@hungpvq/shared';
import { Ref, computed, onMounted, onUnmounted, ref } from 'vue';
import { useDragItem, useDrawerItem } from '../store';
import { LocationSideBar } from '../types';

export function useInitDrawer(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: {
    title?: string;
    type: 'item-drawer';
    location: LocationSideBar | Ref<LocationSideBar>;
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
  const drawerStore = useDrawerItem(containerId);
  const itemStore = useDragItem(containerId);

  const locationRef = computed(() => {
    const loc = optionDefault.location;
    return (
      typeof loc === 'object' && loc && 'value' in loc ? loc.value : loc
    ) as LocationSideBar;
  });

  onMounted(() => {
    drawerStore.registerDrawer(itemId.value, locationRef.value);
    itemStore.registerAction(itemId.value, {
      title: optionDefault.title,
      type: optionDefault.type,
      location: locationRef.value,
      setZIndex,
      setShow,
    });
  });
  onUnmounted(() => {
    drawerStore.unRegisterDrawer(itemId.value);
  });

  return { itemId };
}
