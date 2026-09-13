import {
  configureDragStore,
  useBottomItem as useBottomItemCore,
  useDragCommands as useDragCommandsCore,
  useDragComponent as useDragComponentCore,
  useDragContainer as useDragContainerCore,
  useDragIsMobile as useDragIsMobileCore,
  useDragItem as useDragItemCore,
  useDragLayout as useDragLayoutCore,
  useDragStore as useDragStoreCore,
  useDrawerItem as useDrawerItemCore,
  useSidebarItem as useSidebarItemCore,
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

/**
 * Re-export through local bindings (not `export { x } from`) so the
 * `configureDragStore` side effect cannot be tree-shaken when Vite rewrites
 * consumer imports straight to `@hungpvq/draggable`.
 */
export const useBottomItem = useBottomItemCore;
export const useDragCommands = useDragCommandsCore;
export const useDragComponent = useDragComponentCore;
export const useDragContainer = useDragContainerCore;
export const useDragIsMobile = useDragIsMobileCore;
export const useDragItem = useDragItemCore;
export const useDragLayout = useDragLayoutCore;
export const useDragStore = useDragStoreCore;
export const useDrawerItem = useDrawerItemCore;
export const useSidebarItem = useSidebarItemCore;
