import {
  ALL_MAP_DATASET_FACTORIES,
  COMPARE_DEMO_DATASET_FACTORIES,
  DATA_MANAGEMENT_DEMO_DATASET_FACTORIES,
  DEMO_CUSTOM_MENU_HANDLER_KEY,
  HIGHLIGHT_DEMO_DATASET_FACTORIES,
  IDENTIFY_DEMO_DATASET_FACTORIES,
  LIST_DEMO_DATASET_FACTORIES,
  loadDemoDatasets,
  MENU_DEMO_DATASET_FACTORIES,
} from '@hungpvq/demo-map-datasets';
import type { MenuItemProps } from '@hungpvq/map-dataset';
import { UniversalRegistry } from '@hungpvq/react-map-core';
import { addDatasetToMap } from './dataset-utils';

let menuHandlerRegistered = false;

export function ensureCustomMenuHandler() {
  if (menuHandlerRegistered) {
    return;
  }
  menuHandlerRegistered = true;
  UniversalRegistry.registerMenuHandler(
    DEMO_CUSTOM_MENU_HANDLER_KEY,
    (props: MenuItemProps) => {
      console.info('custom-menu-handle in registry', props);
    },
  );
}

function addForMap(mapId: string) {
  return (dataset: Parameters<typeof addDatasetToMap>[1]) =>
    addDatasetToMap(mapId, dataset);
}

export async function loadListDemoDatasets(mapId: string) {
  await loadDemoDatasets(addForMap(mapId), [...LIST_DEMO_DATASET_FACTORIES]);
}

export async function loadMenuDemoDatasets(mapId: string) {
  ensureCustomMenuHandler();
  await loadDemoDatasets(addForMap(mapId), [...MENU_DEMO_DATASET_FACTORIES]);
}

export async function loadIdentifyDemoDatasets(mapId: string) {
  await loadDemoDatasets(addForMap(mapId), [...IDENTIFY_DEMO_DATASET_FACTORIES]);
}

export async function loadHighlightDemoDatasets(mapId: string) {
  await loadDemoDatasets(addForMap(mapId), [...HIGHLIGHT_DEMO_DATASET_FACTORIES]);
}

export async function loadAllMapDatasets(mapId: string) {
  await loadDemoDatasets(addForMap(mapId), [...ALL_MAP_DATASET_FACTORIES]);
}

export async function loadCompareDatasets(mapId: string) {
  await loadDemoDatasets(addForMap(mapId), [...COMPARE_DEMO_DATASET_FACTORIES]);
}

export async function loadDataManagementDemoDatasets(mapId: string) {
  await loadDemoDatasets(
    addForMap(mapId),
    [...DATA_MANAGEMENT_DEMO_DATASET_FACTORIES],
  );
}
