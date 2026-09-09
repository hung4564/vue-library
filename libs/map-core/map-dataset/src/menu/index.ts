/**
 * Public entry for `@hungpvq/map-dataset/menu`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export {
  addMenuBuilder,
  createMenuBuilder,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  createMenuClickFitBoundsBuilder,
  createMenuClickHighlightBuilder,
  createMenuProps,
} from './builder';
export type {
  MenuClickAddComponent,
  MenuClickFitBounds,
  MenuClickHighlight,
} from './builder';
export type { WithMenuBuilder } from './types';
export {
  createMenuConditionContext,
  isMenuItemDisabled,
  isMenuItemHidden,
  resolveMenuCondition,
  resolveMenuContextSource,
} from './condition';
export type {
  MenuCondition,
  MenuConditionContext,
  MenuContextSource,
  MenuItemClick,
  MenuItemProps,
} from './types';
export { getItemMenuHost, getResolvedMenus } from './dataset';
export {
  BuilderCommandHandler,
  DirectCommandHandler,
  FunctionCommandHandler,
  StringCommandHandler,
  TupleCommandHandler,
  createCommandHandler,
  handleMenuAction,
  handleMenuActionClick,
} from './handle';
export {
  LIST_VIEW_MENU_COMPONENT_KEY,
  LIST_VIEW_MENU_ID,
  createAddToGroupSubmenu,
  createMenuItem,
  createMenuItemAddToGroup,
  createMenuItemIdentifyForList,
  createMenuItemMoveDown,
  createMenuItemMoveUp,
  createMenuItemSetOpacity,
  createMenuItemShowDetailForItem,
  createMenuItemShowDetailInfoSource,
  createMenuItemStyleEdit,
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
  createWithMenuHelper,
  isListViewReorderMenuHidden,
  isMenuItemCustomComponent,
  listViewIdentifyMenuId,
} from './items';
export type { IdentifyForListMenuOptions, ListViewGroupOption } from './items';
export { getMenuItemLocation, resolveMenuItemLocation } from './location';
export type {
  WithLayerItemActionType,
  WithLayerItemMenuComponentType,
} from './layer-item';
export {
  MAP_CONTEXT_MENU_ID,
  clearAddGeojsonHereItems,
  createAddGeojsonHereDef,
  createBufferHereDef,
  createDefaultMapContextMenuItems,
  createMapContextMenuBuilder,
  createMapMenuBuilder,
  createMenuItemCenterMapHere,
  createMenuItemCopyAsGeojson,
  createMenuItemCopyCoords,
  createMenuItemCopyWkt,
  createMenuItemGoogleEarth,
  createMenuItemGoogleMaps,
  createMenuItemIdentifyHere,
  createMenuItemQuickAnalysis,
  createMenuItemZoomInHere,
  getDefaultAddGeojsonHereItems,
  setAddGeojsonHereItems,
} from './map-context-menu';
export { createDatasetPartMenuComponent } from './part-menu.model';
export { createDatasetPartMenuComponentBuilder } from './part-menu.builder';

export type {
  MenuAction,
  MenuActionLocation,
  WithMenuHelper,
} from '../interfaces';
