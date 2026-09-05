import { onMounted } from 'vue';
import { useDragItem } from '../store';
import { ContainerStoreOtherAction } from '../types';

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
