import '@hungpvq/draggable';
import './style.css';
/** Ensure React `configureDragStore` runs before any shell/hook consumers. */
import './store';

/**
 * Root barrel is an **explicit Stable allowlist** (+ experimental re-exports).
 * Do not reintroduce `export *`. See `libs/draggable/core/docs/stable-api.md`.
 *
 * Shell exports use import-then-export so Vite ESM binds names even when the
 * components graph is heavy (avoids "does not provide an export named …").
 */
import {
  DraggableContainer,
  DraggableItemBottom,
  DraggableItemDrawer,
  DraggableItemFloat,
  DraggableItemModal,
  DraggableItemPopup,
  DraggableItemSideBar,
} from './components/draggable';

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

// --- Stable: store + React wiring ---
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
} from './store';
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
  Item,
  ItemList,
  ManagementControl,
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
