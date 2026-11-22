import type { LocationSideBar } from '@hungpvq/draggable';
import { getUUIDv4 } from '@hungpvq/shared';
import { useEffect, useRef, useState } from 'react';

import { useDragItem, useDragStore, useDrawerItem } from '@hungpvq/draggable';
import { recordDragItemOrigin } from '../debug/origin';
import { useStoreReactive } from '../store/useStoreReactive';

export function useInitDrawer(
  containerId: string,
  setShow: (value: boolean) => void,
  optionDefault: {
    title?: string;
    type: 'item-drawer';
    location: LocationSideBar;
  },
  stableId?: string,
) {
  const [itemId] = useState(() => stableId || `draggable-item-${getUUIDv4()}`);
  const [, setZIndexState] = useState(0);

  function setZIndex(value: number) {
    setZIndexState(value);
  }

  const drawerStore = useDrawerItem(containerId);
  const itemStore = useDragItem(containerId);
  const dragStore = useDragStore();
  const drawerStoreRef = useRef(drawerStore);
  drawerStoreRef.current = drawerStore;
  const itemStoreRef = useRef(itemStore);
  itemStoreRef.current = itemStore;
  const optionDefaultRef = useRef(optionDefault);
  optionDefaultRef.current = optionDefault;
  const setShowRef = useRef(setShow);
  setShowRef.current = setShow;
  const originStack = useRef<string | undefined>(undefined);
  if (!originStack.current) originStack.current = new Error().stack;

  useEffect(() => {
    const options = optionDefaultRef.current;
    drawerStoreRef.current.registerDrawer(itemId, options.location);
    itemStoreRef.current.registerAction(itemId, {
      ...options,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
    });
    recordDragItemOrigin(
      containerId,
      itemId,
      'useInitDrawer',
      originStack.current,
    );
    return () => {
      drawerStoreRef.current.unRegisterDrawer(itemId);
    };
  }, [itemId, containerId]);

  useEffect(() => {
    const stored = dragStore.container[containerId]?.actions?.[itemId];
    const current =
      stored && 'location' in stored ? stored.location : undefined;
    if (!optionDefault.location || current === optionDefault.location) return;
    drawerStoreRef.current.moveDrawerLocation(itemId, optionDefault.location);
    itemStoreRef.current.registerAction(itemId, {
      ...optionDefaultRef.current,
      location: optionDefault.location,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
    });
  }, [optionDefault.location, itemId, containerId, dragStore]);

  useStoreReactive();
  const storedAction = dragStore.container[containerId]?.actions?.[itemId];
  const location =
    storedAction && 'location' in storedAction && storedAction.location
      ? (storedAction.location as LocationSideBar)
      : optionDefault.location;

  return { itemId, location };
}
