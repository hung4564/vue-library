/**
 * Root barrel: explicit named exports (Stable).
 * Domain symbols live on `@hungpvq/map-dataset/<domain>` subpaths (breaking major).
 * Highlight APIs live on `@hungpvq/map-dataset/highlight` (not re-exported here).
 * Do not reintroduce `export *`. See libs/map-core/core/docs/core/stable-api.md.
 * Direct leaf imports (no internal-barrel).
 */
export { DatasetError } from './errors/index';

export { MAP_DATASET_STORE_KEY } from './store-key';
export type { MapDatasetStoreKey } from './store-key';

export { createWithDataHelper } from './extra/data/index';

export { DATASET_CONTROL_LOCALE } from './extra/dataset-control/locale';

export { MAP_DATASET_LOCALE_EN } from './locale/locale.en';
export { MAP_DATASET_LOCALE_VI } from './locale/locale.vi';

export { getDatasetDetailInfo } from './extra/detail/info';

export {
  LAYER_DETAIL_FIELD_LOCALE,
  LAYER_DETAIL_LOCALE,
} from './extra/detail/locale';

export {
  addDatasetWithEvent,
  createWithEventHelper,
} from './extra/event/model';

export { addFieldBuilder } from './extra/field/index';

export {
  LAYER_CONTROL_CREATE_LOCALE,
  LAYER_CONTROL_FIELD_LOCALE,
  LAYER_CONTROL_LOCALE,
  LAYER_CONTROL_TOGGLE_LOCALE,
} from './extra/layer-control/locale';

export {
  layerGroupName,
  layerMatchesSearch,
  layerNameMatchesSearch,
  normalizeLayerSearchQuery,
  splitSearchHighlight,
} from './extra/layer-control/search';

export { getLayerControlTitleMenuState } from './extra/layer-control/title-menus';
export type { LayerControlTitleMenuState } from './extra/layer-control/title-menus';

export { registerAddGeojsonHereForMap } from './extra/layer-control/add-geojson-here';

export {
  applyGlobalLayerVisibility,
  applyListViewMapVisibility,
  setListViewIntendedShow,
} from './extra/layer-control/visibility';

export {
  applyToggleShowIntent,
  bindToggleShowAction,
  getToggleShowTitleKey,
  nextToggleShowValue,
  performToggleShowAction,
  readToggleShowEvent,
  TOGGLE_SHOW_LAYER_EVENT,
} from './extra/layer-control/toggle-show-action';
export type { ToggleShowLayerEvent } from './extra/layer-control/toggle-show-action';

export { setOpacity, toggleShow } from './interfaces/dataset.extra';

export { createBase, createNamedComponent } from './model/base';

export {
  createDataset,
  createGroupDataset,
  createRootDataset,
  DatasetComposite,
  DatasetLeaf,
} from './model/dataset.base';

export {
  addDatasetWithChildren,
  createDatasetComponent,
  createDatasetLeaf,
} from './model/dataset.base.function';

export { createDatasetPartMapboxLayerComponent } from './model/layer/base';

export { createMultiMapboxLayerComponent } from './model/layer/model';

export {
  createDatasetPartGroupSubListViewUiComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartSubListViewUiComponentBuilder,
} from './model/list/builder';

export {
  createDatasetPartGroupSubListViewUiComponent,
  createDatasetPartListViewUiComponent,
  createDatasetPartSubListViewUiComponent,
} from './model/list/model';

export {
  addListViewsToGroup,
  addListViewsToNewGroup,
  canMoveListView,
  getListViewGroupInfo,
  listListViewGroups,
  moveListView,
  sortListViews,
  syncListViewLayerOrder,
} from './model/list/order';

export { createDatasetPartBoundComponent } from './model/part-bound.model';

export { createDatasetPartMetadataComponent } from './model/part-metadata.model';

export { createDatasetPartMapboxSourceComponent } from './model/source/base';

export {
  findAllComponentsByType,
  findPartByType,
  findRoot,
  findSiblingOrNearestLeaf,
  runAllComponentsWithCheck,
} from './model/visitors/helpers';

export {
  traverseTree,
  traverseTreeBFS,
  traverseTreeDFS,
} from './model/visitors/traverse';

export { DatasetService } from './services/dataset.service';

export { resolveDatasetBbox } from './utils/bbox';

export {
  hasMoveLayer,
  isComposite,
  isDatasetHasMethod,
  isDatasetMapHasAddToMap,
  isDatasetMapHasRemoveFromMap,
  isDatasetSourceMap,
  isHasSetOpacity,
  isHasToggleShow,
  isIdentifyMergeView,
  isListView,
  isMapboxLayerView,
} from './utils/check';

export { convertFeatureToItem, convertItemToFeature } from './utils/convert';

export { getDatasetSourceKind } from './utils/source-kind';

export {
  convertListToTree,
  convertTreeToList,
  createDefaultGroup,
  isGroupNode,
  mergeEmptyGroups,
} from './utils/tree';

export { createDataManagement, isDataManagementView } from './data-management';

export {
  removeDatasetComponent,
  upsertDatasetComponent,
} from './store/component-crud';
export type {
  DatasetComponentItem,
  DatasetComponentListState,
} from './store/component-crud';

export {
  resetDatasetRegistryWarnFlag,
  warnIfDatasetRegistryMissing,
} from './utils/warn-registry';

/** @experimental Root logger namespaces — may change in a minor. */
export { logger, loggerHighlight, loggerIdentify } from './logger';

/** First-party types only — import geojson / maplibre types from their packages. */
export type {
  CreateDataManagementOptions,
  DataManagementPart,
  DataRecord,
  DataStore,
  PageQuery,
  PageResult,
} from './data-management';
export type { FieldFeaturesDef } from './extra/field';
export type { IDataset } from './interfaces/dataset.base';
export type { WithSetOpacity } from './interfaces/dataset.extra';
export type {
  IdentifyFeatureRow,
  IdentifyMultiResult,
  IIdentifyView,
  IMapboxLayerView,
} from './interfaces/dataset.parts';
export type {
  IGroupListViewUI,
  IListViewUI,
  LayerListGroupTree,
  LayerListItem,
  LayerListTreeNode,
  ListViewGroupRef,
} from './model/list/types';
export type { DatasetStoreLike } from './services/dataset.service';
export type { ComponentType } from './types';
export type { DatasetSourceKind } from './utils/source-kind';
export type { GroupTree, Item, TreeItem } from './utils/tree';
