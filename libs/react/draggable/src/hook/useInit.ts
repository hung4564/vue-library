import { useEffect, useRef } from 'react';
import { useDragItem } from '../store';
import type { ContainerStoreOtherAction } from '@hungpvq/draggable';

export function useInitAction(
  containerId: string,
  itemId: string,
  action: Partial<ContainerStoreOtherAction>,
) {
  const store = useDragItem(containerId);
  const storeRef = useRef(store);
  storeRef.current = store;
  const actionRef = useRef(action);
  actionRef.current = action;
  useEffect(() => {
    storeRef.current.registerOtherAction(itemId, actionRef.current);
  }, [containerId, itemId]);
}
