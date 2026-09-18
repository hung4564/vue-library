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
  type DragStoreMakeReactive,
} from '@hungpvq/draggable';
import { reactive } from 'vue';

const makeReactive: DragStoreMakeReactive = (value) =>
  reactive(value) as typeof value;

configureDragStore({ makeReactive });

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
