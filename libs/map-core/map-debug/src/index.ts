/**
 * Experimental `@hungpvq/map-debug` — shared debug helpers (no map-dataset).
 */
export {
  installMapDebug,
  isMapDebugInstalled,
  uninstallMapDebug,
} from './install';
export {
  getDatasetStore,
  getMapBag,
  getMapScopedStore,
  listMapIds,
} from './store-access';
export type { DatasetStoreLike, MapCoreBag } from './store-access';

export {
  snapshotGlobalStore,
  snapshotMapScopedStore,
} from './viewers/store-helpers';
export {
  childKeys,
  displayValue,
  getValueType,
  hasChildren,
  previewValue,
} from './viewers/tree-helpers';
export type { TreeValueType } from './viewers/tree-helpers';

export {
  collectErrorMapIds,
  errorMapId,
  filterErrorsByMapId,
  formatDevtoolErrorForCopy,
  formatErrorTime,
  shortMapId as shortErrorMapId,
  shortMapId,
} from './viewers/error-helpers';

export {
  buildRequestFlowSteps,
  buildRequestFlowTree,
  formatFlowDelta,
  formatLogTime,
  LEVEL_FILTERS,
  objectArgs,
  shortActionId,
  stringifyLogRecord,
  textMessage,
} from './viewers/log-helpers';
export type {
  LevelFilter,
  RequestFlowStep,
  RequestFlowTreeNode,
} from './viewers/log-helpers';
