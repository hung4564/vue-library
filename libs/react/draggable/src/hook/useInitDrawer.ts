import { getUUIDv4 } from '@hungpvq/shared';
import { useEffect, useRef, useState } from 'react';
import { useDragItem, useDrawerItem } from '../store';
import { LocationSideBar } from '../types';

export function useInitDrawer(
  containerId: string,
  setShow: (value: boolean) => void,
  optionDefault: {
    title?: string;
    type: 'item-drawer';
    location: LocationSideBar;
  },
) {
  const [itemId] = useState(`draggable-item-${getUUIDv4()}`);
  const [, setZIndexState] = useState(0);

  function setZIndex(value: number) {
    setZIndexState(value);
  }

  const drawerStore = useDrawerItem(containerId);
  const itemStore = useDragItem(containerId);
  const drawerStoreRef = useRef(drawerStore);
  drawerStoreRef.current = drawerStore;
  const itemStoreRef = useRef(itemStore);
  itemStoreRef.current = itemStore;
  const optionDefaultRef = useRef(optionDefault);
  optionDefaultRef.current = optionDefault;
  const setShowRef = useRef(setShow);
  setShowRef.current = setShow;

  useEffect(() => {
    const options = optionDefaultRef.current;
    drawerStoreRef.current.registerDrawer(itemId, options.location);
    itemStoreRef.current.registerAction(itemId, {
      ...options,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
    });
    return () => {
      drawerStoreRef.current.unRegisterDrawer(itemId);
    };
  }, [itemId]);

  return { itemId };
}
