import '@hungpvq/draggable';
import './style.css';
/** Ensure React `configureDragStore` runs before any shell/hook consumers. */
import {
  DraggableContainer,
  DraggableItemBottom,
  DraggableItemDrawer,
  DraggableItemFloat,
  DraggableItemModal,
  DraggableItemPopup,
  DraggableItemSideBar,
} from './components/draggable';
import './store';

/**
 * Root barrel is an **explicit Stable allowlist** (+ experimental re-exports).
 * Do not reintroduce `export *`. See `libs/draggable/core/docs/stable-api.md`.
 *
 * Shell exports use import-then-export so Vite ESM binds names even when the
 * components graph is heavy (avoids "does not provide an export named …").
 *
 * ESM hoists every import before this body runs, so the tab registers after
 * `./store` has already called `configureDragStore`.
 */

export {
  DraggableContainer,
  DraggableItemBottom,
  DraggableItemDrawer,
  DraggableItemFloat,
  DraggableItemModal,
  DraggableItemPopup,
  DraggableItemSideBar,
};

// --- Stable: HOC ---
export { WithMobileHandle } from './hoc/mobile-handle';

// --- Stable: hooks ---
export {
  useBottomContainer,
  useComponent,
  useContainerSize,
  useExpand,
  useHighlight,
  useIcon,
  useInitAction,
  useInitBottom,
  useInitDrawer,
  useInitItem,
  useInitSidebar,
  useShow,
  useSideBarContainer,
  withExpandEmit,
  withExpandProps,
  withShareComponent,
  withShareProps,
  withShowEmit,
  withShowProps,
} from './hook';
export type {
  PropsShareComponent,
  ShareCardComponent,
  ShareHeaderComponent,
} from './hook/useComponent';
export { useContainerOrder, useManagement } from './hook/useInitItem';

export {
  useContainerReactive,
  useStoreReactive,
} from './store/useStoreReactive';

// --- Stable: React context ---
export { ContainerProvider, useContainerId } from './context/ContainerContext';

// --- Experimental ---
export {
  ContextMenu,
  ContextMenuItem,
  DragDebugViewer,
  Item,
  ItemList,
  ManagementControl,
  registerDragDebugTab,
  ShowStatusDragItem,
  ShowStatusDrawer,
  ShowStatusSideBar,
} from './experimental';
export type {
  ContextMenuItemProps,
  ContextMenuProps,
  ContextMenuRef,
  ItemListProps,
  ItemProps,
  ManagementControlProps,
  ShowStatusDragItemProps,
  ShowStatusDrawerProps,
  ShowStatusSideBarProps,
} from './experimental';
