import type { LocationSideBar } from '@hungpvq/draggable';
import { getUUIDv4 } from '@hungpvq/shared';
import {
  computed,
  type MaybeRef,
  onMounted,
  onUnmounted,
  Ref,
  ref,
  unref,
  watch,
} from 'vue';

import { useDragStore, useSidebarItem } from '@hungpvq/draggable';
import { recordDragItemOrigin } from '../debug/origin';

function resolveTitle(
  title: MaybeRef<string | undefined> | undefined,
): string | undefined {
  return unref(title);
}

export function useInitSidebar(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: {
    title?: MaybeRef<string | undefined>;
    type: 'item-sidebar';
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
  const store = useSidebarItem(containerId);
  const dragStore = useDragStore();

  const locationRef = computed(() => {
    const loc = optionDefault.location;
    return (
      typeof loc === 'object' && loc && 'value' in loc ? loc.value : loc
    ) as LocationSideBar;
  });

  const titleRef = computed(() => resolveTitle(optionDefault.title));

  function currentLocation(): LocationSideBar {
    const action = dragStore.container[containerId]?.actions?.[itemId.value];
    if (action && 'location' in action && action.location) {
      return action.location as LocationSideBar;
    }
    return locationRef.value;
  }

  function syncAction(location: LocationSideBar) {
    store.registerAction(itemId.value, {
      title: titleRef.value,
      type: optionDefault.type,
      location,
      setZIndex,
      setShow,
    });
  }

  onMounted(() => {
    store.registerSideBar(itemId.value, locationRef.value);
    syncAction(locationRef.value);
    recordDragItemOrigin(containerId, itemId.value, 'useInitSidebar');
    if (show.value) {
      store.registerSideBarShow(itemId.value, show.value);
    }
  });
  onUnmounted(() => {
    store.unRegisterSideBar(itemId.value);
  });
  watch(show, (value) => {
    if (value) {
      store.registerSideBarShow(itemId.value, true);
      return;
    }
    // Keep store in sync when parent/registry closes (show→false).
    // Only clear if this item is the active one at its location.
    try {
      const current =
        store.getStoreContainer(containerId).sideBar[locationRef.value]?.show;
      if (current === itemId.value) {
        store.registerSideBarShow(itemId.value, false);
      }
    } catch {
      // container may already be gone during unmount
    }
  });
  watch(locationRef, (next, prev) => {
    if (!next || next === prev) return;
    const wasOpen = show.value;
    store.moveSideBarLocation(itemId.value, next);
    syncAction(next);
    if (wasOpen) store.registerSideBarShow(itemId.value, true);
  });
  // Keep switcher menu labels in sync when locale / title prop updates.
  // Use the store location so a debug/command move is not overwritten.
  watch(titleRef, () => {
    syncAction(currentLocation());
  });
  const location = computed(() => {
    const action = dragStore.container[containerId]?.actions?.[itemId.value];
    if (action && 'location' in action && action.location) {
      return action.location as LocationSideBar;
    }
    return locationRef.value;
  });
  return { itemId, zIndex, location };
}
