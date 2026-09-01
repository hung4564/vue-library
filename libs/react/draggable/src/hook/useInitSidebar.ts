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

  useEffect(() => {
    const currentStore = storeRef.current;
    const options = optionDefaultRef.current;
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
    // Match Vue: only push show→true into the store.
    // Calling registerSideBarShow(id, false) here races with sidebar switching:
    // selectSideBar(newId) sets store.show=newId then old item's show→false
    // would clear the newly selected sidebar.
    if (show) {
      storeRef.current.registerSideBarShow(itemId, show);
    }
  }, [show, itemId]);

  const location = useMemo(() => {
    return optionDefault.location;
  }, [optionDefault.location]);

  return { itemId, zIndex, location };
}

// useContainerOrder is exported from useInitItem.ts only (avoids conflicting star exports)
