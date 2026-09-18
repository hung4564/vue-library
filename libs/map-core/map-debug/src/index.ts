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
  offsetParentRect,
  panelPosStyle,
} from './viewers/panel-drag';
export type { PanelDragHandlers, PanelPos } from './viewers/panel-drag';

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
  GROUP_LEVELS,
  UUID_RE,
  logMapId,
  shortMapId,
  formatArg,
  namespaceKey,
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
} from './viewers/log-helpers';
export type {
  LevelFilter,
  StructuredGroup,
  StructuredLog,
  StructuredItem,
} from './viewers/log-helpers';
