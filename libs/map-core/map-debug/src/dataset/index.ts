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
export type { CommonDatasetPartType } from './describe';
export {
  COMMON_DATASET_PART_TYPES,
  describeDataset,
  getMenuPartData,
  getMenusRaw,
  listTypesInSubtree,
  suggestPartTypes,
} from './describe';
export {
  debugFindAllByType,
  debugFindPartByType,
  explainFindPart,
} from './find';
export {
  collectSearchableDatasets,
  filterSearchableDatasets,
  getDatasetHierarchyKind,
  inspectDataset,
  listTypesInStoreRoots,
} from './inspect';
export type {
  CaptureDatasetFromMenuOptions,
  CreateMenuItemDebugDatasetOptions,
} from './menu-debug-item';
export {
  captureDatasetFromMenu,
  createMenuItemDebugDataset,
  installDatasetDebugMenus,
  MENU_ITEM_DEBUG_DATASET_ICON,
  MENU_ITEM_DEBUG_DATASET_ID,
  MENU_ITEM_DEBUG_DATASET_ID_ITEM,
  openDatasetDevtools,
  uninstallDatasetDebugMenus,
} from './menu-debug-item';
export {
  explainMenus,
  findMenuInResolved,
  inspectMenuAction,
  invokeResolvedMenu,
  MENU_CONTROL_ID,
  menuDebugKey,
  resolveAndPartitionMenus,
} from './menu-preview';
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
