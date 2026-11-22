/**
 * Public entry for `@hungpvq/map-dataset/menu`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export type {
  MenuAction,
  MenuActionLocation,
  WithMenuHelper,
} from '../interfaces/dataset.parts';
export type {
  MenuClickAddComponent,
  MenuClickFitBounds,
  MenuClickHighlight,
} from './builder';
export {
  addMenuBuilder,
  createMenuBuilder,
  createMenuClickAddComponentBuilder,
  createMenuClickBuilder,
  createMenuClickFitBoundsBuilder,
  createMenuClickHighlightBuilder,
  createMenuProps,
} from './builder';
export {
  createMenuConditionContext,
  isMenuItemDisabled,
  isMenuItemHidden,
  resolveMenuCondition,
  resolveMenuContextSource,
} from './condition';
export { getItemMenuHost, getLayerMenuHost, getResolvedMenus } from './dataset';
export {
  resolveFitBoundsMenuTarget,
  runFitBoundsMenuAction,
} from './fit-bounds';
export {
  clearGlobalDatasetMenus,
  getGlobalDatasetMenus,
  registerGlobalDatasetMenus,
} from './global-defaults';
export {
  BuilderCommandHandler,
  createCommandHandler,
  DirectCommandHandler,
  FunctionCommandHandler,
  handleMenuAction,
  handleMenuActionClick,
  StringCommandHandler,
  TupleCommandHandler,
} from './handle';
export type { IdentifyForListMenuOptions, ListViewGroupOption } from './items';
export {
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
  LIST_VIEW_MENU_COMPONENT_KEY,
  LIST_VIEW_MENU_ID,
  listViewIdentifyMenuId,
} from './items';
export type {
  WithLayerItemActionType,
  WithLayerItemMenuComponentType,
} from './layer-item';
export type { LegendPropsMap, LegendType } from './legend';
export { createLegend, createMultiLegend } from './legend';
export type { PartitionedMenuActions } from './location';
export {
  filterLayerDetailHeaderMenus,
  getMenuItemLocation,
  mergeMenusById,
  partitionMenuActions,
  resolveMenuItemLocation,
} from './location';
export { createMapContextMenuBuilder } from './map-context-menu';
export { createDatasetPartMenuComponentBuilder } from './part-menu.builder';
export { createDatasetPartMenuComponent } from './part-menu.model';
export type {
  MenuByControl,
  MenuControlId,
  MenuControlPlacement,
} from './placement';
export {
  applyMenuControlPlacement,
  getEffectiveMenuItemLocation,
  MENU_CONTROL_ID,
} from './placement';
export type { DatasetRegistryComponentKey } from './registry-plugin';
export {
  DATASET_REGISTRY_SLOTS,
  registerDatasetRegistryComponents,
  resolveDatasetRegistryKey,
} from './registry-plugin';
export type { WithMenuBuilder } from './types';
export type {
  MenuCondition,
  MenuConditionContext,
  MenuContextSource,
  MenuItemClick,
  MenuItemProps,
} from './types';
