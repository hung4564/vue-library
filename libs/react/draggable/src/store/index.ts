import {
  configureDragStore,
  useBottomItem,
  useDragCommands,
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragLayout,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
} from '@hungpvq/draggable';
import { GlobalStoreService } from '@hungpvq/shared-store';

function notifyStoreChange(path?: string | string[]) {
  const storeService = GlobalStoreService.getInstance();

  if (!path) {
    const currentStore = storeService.get('drag:core');
    if (currentStore !== undefined) {
      storeService.set('drag:core', currentStore);
    }
    return;
  }

  // Prefer path-scoped notify so container subscribers do not all wake on
  // unrelated mutations. Root `drag:core` listeners only update when path is omitted
  // or explicitly the root key.
  if (typeof path === 'string') {
    if (storeService.has(path) || path === 'drag:core') {
      const value = storeService.get(path);
      storeService.set(path, value);
    }
    return;
  }

  if (Array.isArray(path) && path.length > 0) {
    const value = storeService.get(path);
    if (value !== undefined || path[0] === 'drag:core') {
      storeService.set(path, value);
    }
  }
}

configureDragStore({ notify: notifyStoreChange });

export {
  useBottomItem,
  useDragCommands,
  useDragComponent,
  useDragContainer,
  useDragIsMobile,
  useDragItem,
  useDragLayout,
  useDragStore,
  useDrawerItem,
  useSidebarItem,
};
