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
  errorMapId,
  shortMapId,
  shortMapId as shortErrorMapId,
  collectErrorMapIds,
  filterErrorsByMapId,
  formatErrorTime,
  formatDevtoolErrorForCopy,
} from './viewers/error-helpers';

export {
  LEVEL_FILTERS,
  formatLogTime,
  textMessage,
  objectArgs,
  stringifyLogRecord,
  buildRequestFlowSteps,
  buildRequestFlowTree,
  formatFlowDelta,
  shortActionId,
} from './viewers/log-helpers';
export type {
  LevelFilter,
  RequestFlowStep,
  RequestFlowTreeNode,
} from './viewers/log-helpers';
