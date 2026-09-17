import { getUUIDv4 } from '@hungpvq/shared';
import {
  Ref,
  computed,
  onMounted,
  onUnmounted,
  ref,
  unref,
  watch,
  type MaybeRef,
} from 'vue';
import { useSidebarItem } from '../store';
import type { LocationSideBar } from '@hungpvq/draggable';

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

  const locationRef = computed(() => {
    const loc = optionDefault.location;
    return (typeof loc === 'object' && loc && 'value' in loc
      ? loc.value
      : loc) as LocationSideBar;
  });

  const titleRef = computed(() => resolveTitle(optionDefault.title));

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
  watch(titleRef, () => {
    syncAction(locationRef.value);
  });
  const location = computed(() => locationRef.value);
  return { itemId, zIndex, location };
}
