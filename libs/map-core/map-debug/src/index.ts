/**
 * Experimental `@hungpvq/map-debug` — shared debug helpers (no map-dataset).
 */
export { installMapDebug, uninstallMapDebug, isMapDebugInstalled } from './install';
export {
  listMapIds,
  getMapBag,
  getMapScopedStore,
  getDatasetStore,
} from './store-access';
export type { MapCoreBag, DatasetStoreLike } from './store-access';

export {
  snapshotGlobalStore,
  snapshotMapScopedStore,
} from './viewers/store-helpers';
export {
  getValueType,
  hasChildren,
  childKeys,
  displayValue,
  previewValue,
} from './viewers/tree-helpers';
export type { TreeValueType } from './viewers/tree-helpers';

export {
  PANEL_DRAG_THRESHOLD_PX,
  beginPanelDrag,
  clampPanelPos,
  fitMovedPanelPos,
  offsetParentRect,
  panelPosStyle,
  reanchorPanelPos,
  samePanelPos,
  syncDevtoolsShellPos,
} from './viewers/panel-drag';
export type {
  DevtoolsShellLayout,
  PanelDragHandlers,
  PanelPos,
  PanelSize,
} from './viewers/panel-drag';

export {
  errorMapId,
  shortMapId as shortErrorMapId,
  collectErrorMapIds,
  filterErrorsByMapId,
  formatErrorTime,
  formatDevtoolErrorForCopy,
} from './viewers/error-helpers';

export {
  LEVEL_FILTERS,
  UUID_RE,
  logMapId,
  shortMapId,
  formatArg,
  namespaceKey,
  rootNamespace,
  displayNamespace,
  entryText,
  filterLogs,
  buildStructuredLogs,
  collectStructuredLogs,
  collectLogMapIds,
  collectNamespaces,
  isObject,
  namespaceParts,
  levelLetter,
  formatLogTime,
  textMessage,
  objectArgs,
  countNewLogsWhilePaused,
  collectLogsByRequestId,
  compareLogOrder,
  buildRequestFlowSteps,
  buildRequestFlowTree,
  formatFlowDelta,
  shortRequestId,
} from './viewers/log-helpers';
export type {
  LevelFilter,
  StructuredGroup,
  StructuredLog,
  StructuredItem,
  RequestFlowStep,
  RequestFlowTreeNode,
} from './viewers/log-helpers';
