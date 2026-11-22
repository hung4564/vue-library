import type { LocationSideBar } from '@hungpvq/draggable';
import { getUUIDv4 } from '@hungpvq/shared';
import { computed, onMounted, onUnmounted, Ref, ref, watch } from 'vue';

import { useDragItem, useDragStore, useDrawerItem } from '@hungpvq/draggable';
import { recordDragItemOrigin } from '../debug/origin';

export function useInitDrawer(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: {
    title?: string;
    type: 'item-drawer';
    location: LocationSideBar | Ref<LocationSideBar>;
  },
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
  const drawerStore = useDrawerItem(containerId);
  const itemStore = useDragItem(containerId);
  const dragStore = useDragStore();

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
    recordDragItemOrigin(containerId, itemId.value, 'useInitDrawer');
  });
  onUnmounted(() => {
    drawerStore.unRegisterDrawer(itemId.value);
  });

  watch(locationRef, (next, prev) => {
    if (!next || next === prev) return;
    drawerStore.moveDrawerLocation(itemId.value, next);
    itemStore.registerAction(itemId.value, {
      title: optionDefault.title,
      type: optionDefault.type,
      location: next,
      setZIndex,
      setShow,
    });
  });

  const location = computed(() => {
    const action = dragStore.container[containerId]?.actions?.[itemId.value];
    if (action && 'location' in action && action.location) {
      return action.location as LocationSideBar;
    }
    return locationRef.value;
  });

  return { itemId, location };
}
