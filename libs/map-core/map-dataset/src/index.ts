/**
 * Root barrel: explicit named exports (Stable).
 * Domain symbols live on `@hungpvq/map-dataset/<domain>` subpaths (breaking major).
 * Do not reintroduce `export *`. See libs/map-core/core/docs/core/stable-api.md.
 * Aggregation lives in ./internal-barrel (not a public package entry).
 */
export {
  DATASET_CONTROL_LOCALE,
  DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY,
  DatasetComposite,
  DatasetError,
  DatasetLeaf,
  DatasetService,
  LAYER_CONTROL_CREATE_LOCALE,
  LAYER_CONTROL_FIELD_LOCALE,
  LAYER_CONTROL_LOCALE,
  LAYER_CONTROL_TOGGLE_LOCALE,
  LAYER_DETAIL_FIELD_LOCALE,
  LAYER_DETAIL_LOCALE,
  LAYER_INFO_CONTROL_LOCALE,
  addDatasetWithChildren,
  addDatasetWithEvent,
  addFieldBuilder,
  addListViewsToGroup,
  addListViewsToNewGroup,
  applyGlobalLayerVisibility,
  applyHighlightFeatureState,
  applyListViewMapVisibility,
  applyToAllLeaves,
  canMoveListView,
  clearHighlightFeatureState,
  convertFeatureToItem,
  convertItemToFeature,
  convertListToTree,
  createBase,
  createDataset,
  createDatasetComponent,
  createDatasetLeaf,
  createDatasetPartBoundComponent,
  createDatasetPartChangeColorHighlightComponent,
} from './internal-barrel';

export {
  createDatasetPartCustomAnimateHighlightComponent,
  createDatasetPartFeatureStateHighlightComponent,
  createDatasetPartGroupSubListViewUiComponent,
  createDatasetPartGroupSubListViewUiComponentBuilder,
  createDatasetPartHighlightComponent,
  createDatasetPartListViewUiComponent,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartMapboxLayerComponent,
  createDatasetPartMapboxSourceComponent,
  createDatasetPartMetadataComponent,
  createDatasetPartShadowHighlightComponent,
  createDatasetPartSubListViewUiComponent,
  createDatasetPartSubListViewUiComponentBuilder,
  createDefaultHighlightLayerIds,
  createDefaultHighlightLayers,
  createFeatureStateHighlightLayers,
  createGroupDataset,
  createHighlightFilter,
  createMultiMapboxLayerComponent,
  createNamedComponent,
  createRootDataset,
  createShadowHighlightLayers,
  createWithDataHelper,
  createWithEventHelper,
  defaultAnimate,
  ensureHighlightLayers,
  ensureHighlightSource,
  featureStatePulseAnimate,
  findAllComponentsByType,
  findAllDatasetsMatching,
  findFirstLeafByType,
  findRoot,
  findSiblingOrNearestLeaf,
  layerGroupName,
  layerMatchesSearch,
  layerNameMatchesSearch,
  normalizeLayerSearchQuery,
} from './internal-barrel';

export {
  getDatasetDetailInfo,
  getDatasetSourceKind,
  getListViewGroupInfo,
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
  isValidBbox,
  listListViewGroups,
  moveListView,
  printTreeFromNode,
  printTreeFromRoot,
  resolveDatasetBbox,
  resolveHighlightFeatureId,
  runAllComponentsWithCheck,
  setListViewIntendedShow,
  setOpacity,
  setPaintIfLayer,
  sortListViews,
  splitSearchHighlight,
  syncListViewLayerOrder,
  toExpressionFilter,
  toggleShow,
} from './internal-barrel';

export {
  traverseTree,
  traverseTreeBFS,
  traverseTreeDFS,
  useHighlightAnimation,
} from './internal-barrel';

export {
  createDataManagement,
  isDataManagementView,
} from './data-management';

/** First-party types only — import geojson / maplibre types from their packages. */
export type {
  IDataset,
  IMapboxLayerView,
  IdentifyFeatureRow,
  IdentifyMultiResult,
  IIdentifyView,
  WithSetOpacity,
} from './interfaces';
export type { IListViewUI } from './model/list';
export type { FieldFeaturesDef } from './extra/field';
export type {
  HighlightFilterCreator,
  HighlightGeoJson,
  HighlightHandle,
  HighlightLayerIds,
  IHighlightView,
} from './model/highlight';
export type { ComponentType } from './types';
export type {
  DatasetSourceKind,
  GroupTree,
  Item,
  TreeItem,
} from './utils';
export type { DatasetStoreLike } from './services/dataset.service';
export type {
  CreateDataManagementOptions,
  DataManagementPart,
  DataRecord,
  DataStore,
  PageQuery,
  PageResult,
} from './data-management';
