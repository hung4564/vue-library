/**
 * Root barrel: explicit named exports (Stable).
 * Domain symbols live on `@hungpvq/map-dataset/<domain>` subpaths (breaking major).
 * Do not reintroduce `export *`. See libs/map-core/core/docs/core/stable-api.md.
 * Aggregation lives in ./internal-barrel (not a public package entry).
 */
import './styles/index.css';

export {
  ATTRIBUTE_TABLE_CONTROL,
  ATTRIBUTE_TABLE_GEOMETRY_KEY,
  ATTRIBUTE_TABLE_LOCALE,
  ATTRIBUTE_TABLE_ROW_HEIGHT,
  getVirtualRowWindow,
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
  attributeTableRowsToFeatureCollection,
  buildAttributeTable,
  canMoveListView,
  clearHighlightFeatureState,
  clearPendingAttributeTableSelectRows,
  convertFeatureToItem,
  convertItemToFeature,
  convertListToTree,
  createBase,
  createDataset,
  createDatasetComponent,
  createDatasetLeaf,
  createDatasetParDraftDataManagementListLocalComponent,
  createDatasetPartBoundComponent,
  createDatasetPartChangeColorHighlightComponent,
} from './internal-barrel';

export {
  createDatasetPartCustomAnimateHighlightComponent,
  createDatasetPartDataManagementComponent,
  createDatasetPartDataManagementDraftComponent,
  createDatasetPartDataManagementListLocalComponent,
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
  createMenuItemAttributeTable,
  createMultiMapboxLayerComponent,
  createNamedComponent,
  createRootDataset,
  createShadowHighlightLayers,
  createWithDataHelper,
  createWithEventHelper,
  defaultAnimate,
  ensureHighlightLayers,
  ensureHighlightSource,
  exportAttributeTableRows,
  featureStatePulseAnimate,
  filterAttributeTableRows,
  findAllComponentsByType,
  findAllDatasetsMatching,
  findFirstLeafByType,
  findRoot,
  findSiblingOrNearestLeaf,
  formatAttributeCell,
} from './internal-barrel';

export {
  getDatasetDetailInfo,
  getDatasetSourceKind,
  getListViewGroupInfo,
  hasMoveLayer,
  isAttributeTableMenuHidden,
  isComposite,
  isDataManagementView,
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
  listLocalAdapter,
  listToFeatureMapper,
  moveListView,
  originMapper,
  printTreeFromNode,
  printTreeFromRoot,
  queueAttributeTableSelectRows,
  resolveAttributeTableColumns,
  resolveAttributeTableSelectedRowIds,
  resolveDatasetBbox,
  resolveHighlightFeatureId,
  runAfterHandlers,
  runAllComponentsWithCheck,
  runBeforeHandlers,
  setListViewIntendedShow,
  setOpacity,
  setPaintIfLayer,
  sortListViews,
  syncListViewLayerOrder,
  takePendingAttributeTableSelectRows,
  toExpressionFilter,
  toggleShow,
} from './internal-barrel';

export {
  traverseTree,
  traverseTreeBFS,
  traverseTreeDFS,
  useHighlightAnimation,
} from './internal-barrel';

/** First-party types only — import geojson / maplibre types from their packages. */
export type {
  IDataset,
  IMapboxLayerView,
  IdentifyMultiResult,
  IIdentifyView,
  WithSetOpacity,
} from './interfaces';
export type { IListViewUI } from './model/list';
export type {
  AttributeTableColumn,
  AttributeTableColumnsOption,
  AttributeTableRow,
  AttributeTableSelectRowsPayload,
} from './extra/attribute-table';
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
