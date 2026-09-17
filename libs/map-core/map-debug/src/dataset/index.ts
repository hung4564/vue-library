/**
 * Experimental `@hungpvq/map-debug/dataset` — requires peer `@hungpvq/map-dataset`.
 *
 * Side-effect: register global Debug menu hooks before `installDatasetDebug()`.
 */
import './menu-debug-item';

export {
  getDatasetDebugApi,
  installDatasetDebug,
  uninstallDatasetDebug,
} from './bridge';
export {
  buildDatasetTree,
  findDatasetById,
  flattenDatasetTree,
  getDatasetChildren,
  getParentChain,
  getPathIds,
  getRootDataset,
  toDatasetSummary,
} from './tree';
export {
  debugFindAllByType,
  debugFindPartByType,
  explainFindPart,
} from './find';
export {
  describeDataset,
  getMenuPartData,
  getMenusRaw,
  listTypesInSubtree,
  suggestPartTypes,
  COMMON_DATASET_PART_TYPES,
} from './describe';
export type { CommonDatasetPartType } from './describe';
export {
  collectSearchableDatasets,
  filterSearchableDatasets,
  getDatasetHierarchyKind,
  inspectDataset,
  listTypesInStoreRoots,
} from './inspect';
export {
  explainMenus,
  findMenuInResolved,
  inspectMenuAction,
  invokeResolvedMenu,
  menuDebugKey,
  resolveAndPartitionMenus,
  MENU_CONTROL_ID,
} from './menu-preview';
export {
  captureDatasetFromMenu,
  createMenuItemDebugDataset,
  installDatasetDebugMenus,
  openDatasetDevtools,
  uninstallDatasetDebugMenus,
  MENU_ITEM_DEBUG_DATASET_ICON,
  MENU_ITEM_DEBUG_DATASET_ID,
  MENU_ITEM_DEBUG_DATASET_ID_ITEM,
} from './menu-debug-item';
export type {
  CaptureDatasetFromMenuOptions,
  CreateMenuItemDebugDatasetOptions,
} from './menu-debug-item';

export type {
  DatasetDebugApi,
  DatasetDebugHelp,
  DatasetDebugSession,
  DatasetDescribe,
  DatasetHierarchyKind,
  DatasetInspectSnapshot,
  DatasetMenuTarget,
  DatasetNodeSummary,
  DatasetSearchHit,
  DatasetTreeNode,
  ExplainStep,
  MenuInspectDetail,
  MenuSourceKind,
  MenuSummary,
  PartitionedMenuSummary,
} from './types';
