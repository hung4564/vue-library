import { onMounted } from 'vue';
import { useDragItem } from '../store';
import type { ContainerStoreOtherAction } from '@hungpvq/draggable';

export function useInitAction(
  containerId: string,
  itemId: string,
  action: Partial<ContainerStoreOtherAction>,
) {
  const store = useDragItem(containerId);
  onMounted(() => {
    store.registerOtherAction(itemId, action);
  });
}
