/**
 * Locks `@hungpvq/map-debug/dataset` runtime export surface (Experimental).
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const MAP_DEBUG_DATASET_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'COMMON_DATASET_PART_TYPES',
  'MENU_CONTROL_ID',
  'MENU_ITEM_DEBUG_DATASET_ICON',
  'MENU_ITEM_DEBUG_DATASET_ID',
  'MENU_ITEM_DEBUG_DATASET_ID_ITEM',
  'buildDatasetTree',
  'captureDatasetFromMenu',
  'createMenuItemDebugDataset',
  'debugFindAllByType',
  'debugFindPartByType',
  'describeDataset',
  'explainFindPart',
  'explainMenus',
  'findDatasetById',
  'findMenuInResolved',
  'flattenDatasetTree',
  'getDatasetChildren',
  'getDatasetDebugApi',
  'getMenuPartData',
  'getMenusRaw',
  'getParentChain',
  'getPathIds',
  'getRootDataset',
  'inspectDataset',
  'inspectMenuAction',
  'installDatasetDebug',
  'installDatasetDebugMenus',
  'invokeResolvedMenu',
  'listTypesInStoreRoots',
  'listTypesInSubtree',
  'menuDebugKey',
  'openDatasetDevtools',
  'resolveAndPartitionMenus',
  'suggestPartTypes',
  'toDatasetSummary',
  'uninstallDatasetDebug',
  'uninstallDatasetDebugMenus',
  'collectSearchableDatasets',
  'filterSearchableDatasets',
  'getDatasetHierarchyKind',
] as const;

describe('dataset public API surface', () => {
  it('dataset runtime exports match Experimental allowlist', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...MAP_DEBUG_DATASET_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
