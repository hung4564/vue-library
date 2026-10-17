import '@hungpvq/draggable';
import './style.css';
/** Ensure Vue `configureDragStore` runs before shell/hook consumers. */
import './store';

/**
 * Root barrel is an **explicit Stable allowlist** (+ experimental re-exports).
 * Do not reintroduce `export *`. See `libs/draggable/core/docs/stable-api.md`.
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
export {
  useContainerOrder,
  useContainerSize,
  useManagement,
} from './hook/useInitItem';

// --- Stable: store (after Vue configureDragStore) ---
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

// --- Experimental (also available as named imports; may change in a minor) ---
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
