import './style.css';
import '@hungpvq/draggable';
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
  DraggableDrawer,
  DraggableItemBottom,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
  DraggableModal,
} from './components/draggable';

export {
  DraggableContainer,
  DraggableDrawer,
  DraggableItemBottom,
  DraggableItemFloat,
  DraggableItemPopup,
  DraggableItemSideBar,
  DraggableModal,
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
export { useContainerOrder, useManagement } from './hook/useInitItem';
export type {
  PropsShareComponent,
  ShareCardComponent,
  ShareHeaderComponent,
} from './hook/useComponent';

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
export { useContainerReactive, useStoreReactive } from './store/useStoreReactive';

// --- Stable: React context ---
export { ContainerProvider, useContainerId } from './context';

// --- Stable: type re-exports from core ---
export type {
  BottomConfig,
  ContainerStore,
  ContainerStoreAction,
  ContainerStoreOtherAction,
  DrawerConfig,
  InitOption,
  ItemGroupConfig,
  ItemGroupKey,
  ItemLayoutState,
  LocationSideBar,
  PanelSnapshot,
  SidebarConfig,
} from '@hungpvq/draggable';
export {
  createEmptyBottom,
  createEmptyContainer,
  createEmptyDrawer,
  createEmptyItemGroup,
  createEmptySideBar,
  itemTypeToGroup,
} from '@hungpvq/draggable';

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
