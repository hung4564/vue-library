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
import { UniversalRegistry } from '@hungpvq/vue-map-core';
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

export async function loadListDemoDatasets(mapId: string) {
  await loadDemoDatasets(
    (dataset) => addDatasetToMap(mapId, dataset),
    [...LIST_DEMO_DATASET_FACTORIES],
  );
}

export async function loadMenuDemoDatasets(mapId: string) {
  ensureCustomMenuHandler();
  await loadDemoDatasets(
    (dataset) => addDatasetToMap(mapId, dataset),
    [...MENU_DEMO_DATASET_FACTORIES],
  );
}

export async function loadIdentifyDemoDatasets(mapId: string) {
  await loadDemoDatasets(
    (dataset) => addDatasetToMap(mapId, dataset),
    [...IDENTIFY_DEMO_DATASET_FACTORIES],
  );
}

export async function loadHighlightDemoDatasets(mapId: string) {
  await loadDemoDatasets(
    (dataset) => addDatasetToMap(mapId, dataset),
    [...HIGHLIGHT_DEMO_DATASET_FACTORIES],
  );
}

export async function loadAllMapDatasets(mapId: string) {
  await loadDemoDatasets(
    (dataset) => addDatasetToMap(mapId, dataset),
    [...ALL_MAP_DATASET_FACTORIES],
  );
}

export async function loadCompareDatasets(mapId: string) {
  await loadDemoDatasets(
    (dataset) => addDatasetToMap(mapId, dataset),
    [...COMPARE_DEMO_DATASET_FACTORIES],
  );
}

export async function loadDataManagementDemoDatasets(mapId: string) {
  await loadDemoDatasets(
    (dataset) => addDatasetToMap(mapId, dataset),
    [...DATA_MANAGEMENT_DEMO_DATASET_FACTORIES],
  );
}
