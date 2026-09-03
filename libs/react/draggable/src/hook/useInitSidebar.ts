import { getUUIDv4 } from '@hungpvq/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSidebarItem } from '../store';
import { LocationSideBar } from '../types';

export function useInitSidebar(
  containerId: string,
  show: boolean,
  setShow: (value: boolean) => void,
  optionDefault: {
    title?: string;
    type: 'item-sidebar';
    location: LocationSideBar;
  },
) {
  const [itemId] = useState(`draggable-item-${getUUIDv4()}`);
  const [zIndex, setZIndexState] = useState(0);

  function setZIndex(value: number) {
    setZIndexState(value);
  }

  const store = useSidebarItem(containerId);
  const storeRef = useRef(store);
  storeRef.current = store;
  const optionDefaultRef = useRef(optionDefault);
  optionDefaultRef.current = optionDefault;
  const setShowRef = useRef(setShow);
  setShowRef.current = setShow;
  const locationRef = useRef(optionDefault.location);

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
    return () => {
      currentStore.unRegisterSideBar(itemId);
    };
  }, [itemId]);

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

  const location = useMemo(() => {
    return optionDefault.location;
  }, [optionDefault.location]);

  return { itemId, zIndex, location };
}

// useContainerOrder is exported from useInitItem.ts only (avoids conflicting star exports)
