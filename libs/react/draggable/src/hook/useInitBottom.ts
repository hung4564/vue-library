import { getUUIDv4 } from '@hungpvq/shared';
import { useEffect, useRef, useState } from 'react';
import { useBottomItem } from '../store';

export function useInitBottom(
  containerId: string,
  show: boolean,
  setShow: (value: boolean) => void,
  optionDefault: {
    title?: string;
    type: 'item-bottom';
  } = { type: 'item-bottom' },
  stableId?: string,
) {
  const [itemId] = useState(
    () => stableId || `draggable-item-${getUUIDv4()}`,
  );
  const [zIndex, setZIndexState] = useState(0);

  function setZIndex(value: number) {
    setZIndexState(value);
  }

  const store = useBottomItem(containerId);
  const storeRef = useRef(store);
  storeRef.current = store;
  const optionDefaultRef = useRef(optionDefault);
  optionDefaultRef.current = optionDefault;
  const setShowRef = useRef(setShow);
  setShowRef.current = setShow;

  useEffect(() => {
    const currentStore = storeRef.current;
    const options = optionDefaultRef.current;
    currentStore.registerBottom(itemId);
    currentStore.registerAction(itemId, {
      ...options,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
    });
    return () => {
      currentStore.unRegisterBottom(itemId);
    };
  }, [itemId]);

  useEffect(() => {
    if (show) {
      storeRef.current.registerBottomShow(itemId, true);
      return;
    }
    try {
      if (storeRef.current.getShow() === itemId) {
        storeRef.current.registerBottomShow(itemId, false);
      }
    } catch {
      // container may already be gone during unmount
    }
  }, [show, itemId]);

  return { itemId, zIndex };
}
