import { getUUIDv4 } from '@hungpvq/shared';
import { useState, useEffect, useMemo } from 'react';
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

  function setShowValue(value: boolean) {
    setShow(value);
  }

  const store = useSidebarItem(containerId);
  useEffect(() => {
    store.registerSideBar(itemId, optionDefault.location);
    store.registerAction(itemId, {
      ...optionDefault,
      setZIndex,
      setShow: setShowValue,
    });
    if (show) {
      store.registerSideBarShow(itemId, show);
    }
    return () => {
      store.unRegisterSideBar(itemId);
    };
  }, []);

  useEffect(() => {
    // Match Vue: only push show→true into the store.
    // Calling registerSideBarShow(id, false) here races with sidebar switching:
    // selectSideBar(newId) sets store.show=newId then old item's show→false
    // would clear the newly selected sidebar.
    if (show) {
      store.registerSideBarShow(itemId, show);
    }
  }, [show, itemId]);

  const location = useMemo(() => {
    return optionDefault.location;
  }, [optionDefault.location]);

  return { itemId, zIndex, location };
}

// useContainerOrder is exported from useInitItem.ts only (avoids conflicting star exports)
