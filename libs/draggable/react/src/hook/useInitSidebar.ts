import type { LocationSideBar } from '@hungpvq/draggable';
import { getUUIDv4 } from '@hungpvq/shared';
import { useEffect, useRef, useState } from 'react';

import { useDragStore, useSidebarItem } from '@hungpvq/draggable';
import { recordDragItemOrigin } from '../debug/origin';
import { useStoreReactive } from '../store/useStoreReactive';

export function useInitSidebar(
  containerId: string,
  show: boolean,
  setShow: (value: boolean) => void,
  optionDefault: {
    title?: string;
    type: 'item-sidebar';
    location: LocationSideBar;
  },
  stableId?: string,
) {
  const [itemId] = useState(() => stableId || `draggable-item-${getUUIDv4()}`);
  const [zIndex, setZIndexState] = useState(0);

  function setZIndex(value: number) {
    setZIndexState(value);
  }

  const store = useSidebarItem(containerId);
  const dragStore = useDragStore();
  const storeRef = useRef(store);
  storeRef.current = store;
  const optionDefaultRef = useRef(optionDefault);
  optionDefaultRef.current = optionDefault;
  const setShowRef = useRef(setShow);
  setShowRef.current = setShow;
  const locationRef = useRef(optionDefault.location);
  const originStack = useRef<string | undefined>(undefined);
  if (!originStack.current) originStack.current = new Error().stack;

  useEffect(() => {
    const currentStore = storeRef.current;
    const options = optionDefaultRef.current;
    locationRef.current = options.location;
    currentStore.registerSideBar(itemId, options.location);
    currentStore.registerAction(itemId, {
      ...options,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
    });
    recordDragItemOrigin(
      containerId,
      itemId,
      'useInitSidebar',
      originStack.current,
    );
    return () => {
      currentStore.unRegisterSideBar(itemId);
    };
  }, [itemId, containerId]);

  useEffect(() => {
    const next = optionDefault.location;
    const prev = locationRef.current;
    if (next === prev) return;
    const wasOpen = show;
    storeRef.current.moveSideBarLocation(itemId, next);
    storeRef.current.registerAction(itemId, {
      ...optionDefaultRef.current,
      location: next,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
    });
    locationRef.current = next;
    if (wasOpen) {
      storeRef.current.registerSideBarShow(itemId, true);
    }
  }, [optionDefault.location, itemId, show]);

  // Keep switcher menu labels in sync when locale / title prop updates.
  // Prefer the store location so a debug/command move is not overwritten.
  useEffect(() => {
    const stored = dragStore.container[containerId]?.actions?.[itemId];
    const loc =
      stored && 'location' in stored && stored.location
        ? (stored.location as LocationSideBar)
        : locationRef.current;
    storeRef.current.registerAction(itemId, {
      ...optionDefaultRef.current,
      location: loc,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
    });
  }, [optionDefault.title, itemId, containerId, dragStore]);

  useEffect(() => {
    if (show) {
      storeRef.current.registerSideBarShow(itemId, true);
      return;
    }
    // Keep store in sync when parent/registry closes (show→false).
    // Only clear if this item is the active one at its location.
    try {
      const loc = locationRef.current;
      const current =
        storeRef.current.getStoreContainer(containerId).sideBar[loc]?.show;
      if (current === itemId) {
        storeRef.current.registerSideBarShow(itemId, false);
      }
    } catch {
      // container may already be gone during unmount
    }
  }, [show, itemId, containerId]);

  useStoreReactive();
  const storedAction = dragStore.container[containerId]?.actions?.[itemId];
  const location =
    storedAction && 'location' in storedAction && storedAction.location
      ? (storedAction.location as LocationSideBar)
      : optionDefault.location;

  return { itemId, zIndex, location };
}

// useContainerOrder is exported from useInitItem.ts only (avoids conflicting star exports)
