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
export { getItemMenuHost, getLayerMenuHost, getResolvedMenus } from './dataset';
export {
  clearGlobalDatasetMenus,
  getGlobalDatasetMenus,
  registerGlobalDatasetMenus,
} from './global-defaults';
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
export {
  filterLayerDetailHeaderMenus,
  getMenuItemLocation,
  mergeMenusById,
  partitionMenuActions,
  resolveMenuItemLocation,
} from './location';
export type { PartitionedMenuActions } from './location';
export {
  MENU_CONTROL_ID,
  applyMenuControlPlacement,
  getEffectiveMenuItemLocation,
} from './placement';
export type {
  MenuByControl,
  MenuControlId,
  MenuControlPlacement,
} from './placement';
export type {
  WithLayerItemActionType,
  WithLayerItemMenuComponentType,
} from './layer-item';
export { createMapContextMenuBuilder } from './map-context-menu';
export { createDatasetPartMenuComponent } from './part-menu.model';
export { createDatasetPartMenuComponentBuilder } from './part-menu.builder';
export { createLegend, createMultiLegend } from './legend';
export type { LegendPropsMap, LegendType } from './legend';
export {
  DATASET_REGISTRY_SLOTS,
  registerDatasetRegistryComponents,
  resolveDatasetRegistryKey,
} from './registry-plugin';
export type { DatasetRegistryComponentKey } from './registry-plugin';

export type {
  MenuAction,
  MenuActionLocation,
  WithMenuHelper,
} from '../interfaces/dataset.parts';
