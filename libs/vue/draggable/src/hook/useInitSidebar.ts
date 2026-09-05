import { getUUIDv4 } from '@hungpvq/shared';
import { Ref, computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useSidebarItem } from '../store';
import { LocationSideBar } from '../types';

export function useInitSidebar(
  containerId: string,
  show: Ref<boolean>,
  optionDefault: {
    title?: string;
    type: 'item-sidebar';
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
  const store = useSidebarItem(containerId);

  const locationRef = computed(() => {
    const loc = optionDefault.location;
    return (typeof loc === 'object' && loc && 'value' in loc
      ? loc.value
      : loc) as LocationSideBar;
  });

  onMounted(() => {
    store.registerSideBar(itemId.value, locationRef.value);
    store.registerAction(itemId.value, {
      title: optionDefault.title,
      type: optionDefault.type,
      location: locationRef.value,
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
    store.registerAction(itemId.value, {
      title: optionDefault.title,
      type: optionDefault.type,
      location: next,
      setZIndex,
      setShow,
    });
    if (wasOpen) store.registerSideBarShow(itemId.value, true);
  });
  const location = computed(() => locationRef.value);
  return { itemId, zIndex, location };
}
