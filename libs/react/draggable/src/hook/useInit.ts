import { useEffect } from 'react';
import { useDragItem } from '../store';
import { ContainerStoreOtherAction } from '../types';

export function useInitAction(
  containerId: string,
  itemId: string,
  action: Partial<ContainerStoreOtherAction>,
) {
  const store = useDragItem(containerId);
  useEffect(() => {
    store.registerOtherAction(itemId, action);
  }, [containerId, itemId]);
}
