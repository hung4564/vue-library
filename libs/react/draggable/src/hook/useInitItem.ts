import { getUUIDv4 } from '@hungpvq/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDragItem, useDragStore } from '../store';
import { useStoreReactive } from '../store/useStoreReactive';
import { InitOption } from '../types';
import { checkIsFirst, checkIsLast } from '../utils/array';

export function useInitItem(
  containerId: string,
  show: boolean,
  setShow: (value: boolean) => void,
  optionDefault: InitOption = {
    type: 'draggable-item',
  },
) {
  const [itemId] = useState(`draggable-item-${getUUIDv4()}`);
  const [zIndex, setZIndexState] = useState(10);

  function setZIndex(value: number) {
    setZIndexState(value);
  }

  const store = useDragItem(containerId);
  const storeRef = useRef(store);
  storeRef.current = store;
  const optionDefaultRef = useRef(optionDefault);
  optionDefaultRef.current = optionDefault;
  const setShowRef = useRef(setShow);
  setShowRef.current = setShow;

  useEffect(() => {
    const currentStore = storeRef.current;
    currentStore.registerItem(itemId);
    currentStore.registerAction(itemId, {
      ...optionDefaultRef.current,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
    });
    return () => {
      currentStore.unRegisterItem(itemId);
    };
  }, [itemId]);

  useEffect(() => {
    storeRef.current.registerItemShow(itemId, show);
  }, [show, itemId]);

  return { itemId, zIndex };
}

export function useContainerOrder(containerId: string, itemId: string) {
  useStoreReactive();
  const store = useDragItem(containerId);
  const items = store.getItems();
  const itemShows = store.getItemsShow();
  const isLast = useMemo(() => {
    return checkIsLast(itemId, itemShows);
  }, [itemId, itemShows]);
  const isFirst = useMemo(() => {
    return checkIsFirst(itemId, itemShows);
  }, [itemId, itemShows]);
  const isHasItems = useMemo(() => {
    return itemShows.length > 1;
  }, [itemShows]);

  function onToBack() {
    store.setToBack(itemId);
  }
  function onToFront() {
    store.setToFront(itemId);
  }
  return { items, itemShows, isLast, isFirst, isHasItems, onToBack, onToFront };
}

// This function is moved to useInitItem.ts but should be in a separate file
// Keeping it here for now to maintain compatibility

export function useManagement(containerId: string) {
  const store = useDragStore();
  const container = store.container[containerId];
  const items = container?.items || [];
  const itemShows = container?.show || [];
  const sideBar = container?.sideBar;
  const width = container?.width || 0;
  const height = container?.height || 0;
  return { containerId, items, itemShows, sideBar, width, height };
}
