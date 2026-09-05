import { checkIsFirst, checkIsLast, itemTypeToGroup } from '@hungpvq/draggable';
import { getUUIDv4 } from '@hungpvq/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDragItem, useDragStore } from '../store';
import { useStoreReactive } from '../store/useStoreReactive';
import { InitOption } from '../types';

export function useInitItem(
  containerId: string,
  show: boolean,
  setShow: (value: boolean) => void,
  optionDefault: InitOption = {
    type: 'item-popup',
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
    currentStore.registerItem(itemId, optionDefaultRef.current.type);
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
  const dragStore = useDragStore();
  const group = itemTypeToGroup(
    dragStore.container[containerId]?.actions?.[itemId]?.type,
  );
  const items = store.getItems(group);
  const itemShows = store.getItemsShow(group);
  const isLast = useMemo(() => {
    return checkIsLast(itemId, itemShows);
  }, [itemId, itemShows]);
  const isFirst = useMemo(() => {
    return checkIsFirst(itemId, itemShows);
  }, [itemId, itemShows]);
  const isHasItems = useMemo(() => {
    return itemShows.length > 1;
  }, [itemShows]);
  const switchItems = useMemo(() => {
    const actions = dragStore.container[containerId]?.actions || {};
    return items.map((id) => ({
      id,
      title: actions[id]?.title || id,
      active: id === itemId,
    }));
  }, [dragStore.container, containerId, itemId, items]);

  function onToBack() {
    store.setToBack(itemId);
  }
  function onToFront() {
    store.setToFront(itemId);
  }
  function selectItem(id: string) {
    const action = dragStore.container[containerId]?.actions?.[id];
    action?.setShow?.(true);
    store.setToFront(id);
  }
  return {
    items,
    itemShows,
    switchItems,
    isLast,
    isFirst,
    isHasItems,
    onToBack,
    onToFront,
    selectItem,
  };
}

export function useManagement(containerId: string) {
  useStoreReactive();
  const store = useDragStore();
  const container = store.container[containerId];
  const empty = { items: [] as string[], show: [] as string[] };
  return {
    containerId,
    popup: container?.popup || empty,
    modal: container?.modal || empty,
    float: container?.float || empty,
    bottom: container?.bottom || empty,
    sideBar: container?.sideBar,
    drawer: container?.drawer,
    width: container?.width || 0,
    height: container?.height || 0,
  };
}
