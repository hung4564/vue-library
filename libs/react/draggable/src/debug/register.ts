import {
  listDragDebugItems,
  useDragStore as getDragStore,
} from '@hungpvq/draggable';
import { registerDebugTab } from '@hungpvq/react-shared-log';
import { peekHungpvqDebugHost } from '@hungpvq/shared-log';

import { DragDebugViewer } from './DragDebugViewer';

function isDragTabOnHost(): boolean {
  return !!peekHungpvqDebugHost()
    ?.listTabs('react')
    .some((tab) => tab.id === 'draggable');
}

export function registerDragDebugTab(): () => void {
  const store = getDragStore();
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
