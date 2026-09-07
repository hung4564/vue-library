import './style.css';
import '@hungpvq/draggable';
/** Ensure Vue `configureDragStore` runs before shell/hook consumers. */
import './store';

/**
 * Root barrel is an **explicit Stable allowlist** (+ experimental re-exports).
 * Do not reintroduce `export *`. See `libs/draggable/core/docs/stable-api.md`.
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
export {
  useContainerOrder,
  useContainerSize,
  useManagement,
} from './hook/useInitItem';
export type {
  PropsShareComponent,
  ShareCardComponent,
  ShareHeaderComponent,
} from './hook/useComponent';

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
  ManagementControl,
} from './experimental';
