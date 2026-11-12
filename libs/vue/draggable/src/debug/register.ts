import { listDragDebugItems, useDragStore } from '@hungpvq/draggable';
import { peekHungpvqDebugHost } from '@hungpvq/shared-log';
import { registerDebugTab } from '@hungpvq/vue-shared-log';

import DragDebugViewer from './DragDebugViewer.vue';

function isDragTabOnHost(): boolean {
  return !!peekHungpvqDebugHost()
    ?.listTabs('vue')
    .some((tab) => tab.id === 'draggable');
}

export function registerDragDebugTab(): () => void {
  const store = useDragStore();
  if (store.debugTabUnsub && isDragTabOnHost()) return store.debugTabUnsub;
  const unsub = registerDebugTab({
    id: 'draggable',
    label: 'Draggable',
    order: 20,
    badge: () => {
      const n = listDragDebugItems().length;
      return n > 0 ? n : undefined;
    },
    component: DragDebugViewer,
  });
  const stop = () => {
    unsub();
    if (store.debugTabUnsub === stop) store.debugTabUnsub = undefined;
  };
  store.debugTabUnsub = stop;
  return stop;
}
