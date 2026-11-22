import './style/index.css';

/**
 * Root barrel is an **explicit Stable allowlist** (see `docs/stable-api.md`).
 * Do not reintroduce `export *` — new symbols must be added here and to the
 * public-api lock test + Stable docs (or marked experimental in adapters).
 */

export {
  applyDragDebugAction,
  canMove,
  canStack,
  captureDragOrigin,
  describeDragOrigin,
  detailRows,
  dragOriginKey,
  formatDragOrigin,
  isInternalDragOriginName,
  listDragDebugContainers,
  listDragDebugItems,
  LOCATION_ITEMS,
  LOCATIONS,
  registerDragItemOrigin,
  rowKey,
} from './debug';
export type {
  DragDebugAction,
  DragDebugItem,
  DragItemOrigin,
  DragItemOriginKind,
} from './debug';
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
export type { DragStoreMakeReactive, DragStoreNotify } from './store';
export {
  createEmptyBottom,
  createEmptyContainer,
  createEmptyDrawer,
  createEmptyItemGroup,
  createEmptySideBar,
  itemTypeToGroup,
} from './types';
export type {
  BottomConfig,
  ContainerStore,
  ContainerStoreAction,
  ContainerStoreOtherAction,
  DraggableItemType,
  DrawerConfig,
  InitOption,
  ItemGroupConfig,
  ItemGroupKey,
  ItemLayoutState,
  LocationSideBar,
  PanelSnapshot,
  SidebarConfig,
} from './types';
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
export type { Bounds } from './utils';
