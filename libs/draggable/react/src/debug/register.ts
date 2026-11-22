import { listDragDebugItems } from '@hungpvq/draggable';
import { registerDebugTab } from '@hungpvq/react-shared-log';

import { DragDebugViewer } from './DragDebugViewer';

export function registerDragDebugTab(): () => void {
  return registerDebugTab({
    id: 'draggable',
    label: 'Draggable',
    order: 20,
    badge: () => {
      const n = listDragDebugItems().length;
      return n > 0 ? n : undefined;
    },
    component: DragDebugViewer,
  });
}
