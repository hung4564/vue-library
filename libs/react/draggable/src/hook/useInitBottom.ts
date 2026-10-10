import { getUUIDv4 } from '@hungpvq/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useBottomItem } from '../store';

type BottomItemOptions = {
  title?: string;
  type: 'item-bottom';
  componentCard?: unknown;
  componentCardHeader?: unknown;
};

const DEFAULT_OPTION: BottomItemOptions = {
  type: 'item-bottom',
};

export function useInitBottom(
  containerId: string,
  show: boolean,
  setShow: (value: boolean) => void,
  optionDefault: BottomItemOptions = DEFAULT_OPTION,
  stableId?: string,
) {
  const [itemId] = useState(() => stableId || `draggable-item-${getUUIDv4()}`);

  const [zIndex, setZIndexState] = useState(0);
  const [initDone, setInitDone] = useState(false);
  const storeRef = useRef(useBottomItem(containerId));
  const setShowRef = useRef(setShow);

  setShowRef.current = setShow;

  const setZIndex = useCallback((value: number) => {
    setZIndexState(value);
  }, []);

  useEffect(() => {
    const currentStore = storeRef.current;
    currentStore.registerBottom(itemId);

    const prev = currentStore.getStoreContainer(containerId).actions[itemId];

    currentStore.registerAction(itemId, {
      title: optionDefault.title,
      type: optionDefault.type,
      setZIndex,
      setShow: (value: boolean) => setShowRef.current(value),
      open: prev?.open,
      close: prev?.close,
      setHighLight: prev?.setHighLight,
      componentCard: optionDefault.componentCard,
      componentCardHeader: optionDefault.componentCardHeader,
    });

    setInitDone(true);
    return () => {
      currentStore.unRegisterBottom(itemId);
    };
  }, [
    itemId,
    containerId,
    optionDefault.title,
    optionDefault.type,
    optionDefault.componentCard,
    optionDefault.componentCardHeader,
    setZIndex,
  ]);

  useEffect(() => {
    if (!initDone) {
      return;
    }
    if (show) {
      storeRef.current.registerBottomShow(itemId, true);
      return;
    }

    try {
      if (storeRef.current.getShow() === itemId) {
        storeRef.current.registerBottomShow(itemId, false);
      }
    } catch {
      // Container có thể đã bị xóa trong lúc unmount.
    }
  }, [show, itemId, initDone]);

  return { itemId, zIndex };
}
