import './style/index.css';

/**
 * Root barrel is an **explicit Stable allowlist** (see `docs/stable-api.md`).
 * Do not reintroduce `export *` — new symbols must be added here and to the
 * public-api lock test + Stable docs (or marked experimental in adapters).
 */

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
  DraggableItemType,
} from './types';
export {
  createEmptyBottom,
  createEmptyContainer,
  createEmptyDrawer,
  createEmptyItemGroup,
  createEmptySideBar,
  itemTypeToGroup,
} from './types';

export type { DragStoreMakeReactive, DragStoreNotify } from './store';
export {
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
} from './store';

export type { Bounds } from './utils';
export {
  assertDefined,
  checkIsFirst,
  checkIsLast,
  clampBounds,
  clearMenuTypeahead,
  focusFirst,
  getFocusableElements,
  getMenuItems,
  handleMenuKeydown,
  restoreFocus,
  setModalSiblingsInert,
  trapTabKey,
} from './utils';
