import {
  ALL_MAP_DATASET_FACTORIES,
  DATA_MANAGEMENT_DEMO_DATASET_FACTORIES,
  DATA_MANAGEMENT_HTTP_CUSTOM_DATASET_NAME,
  DATA_MANAGEMENT_HTTP_CUSTOM_LIST_NAME,
  DATA_MANAGEMENT_HTTP_DATASET_NAME,
  DATA_MANAGEMENT_HTTP_LIST_NAME,
  DATA_MANAGEMENT_LOCAL_GEOJSON_LIST_NAME,
  DATA_MANAGEMENT_LOCAL_LIST_NAME,
  DATA_MANAGEMENT_MEMORY_LIST_NAME,
  DEMO_CUSTOM_MENU_HANDLER_KEY,
  findDataManagementPart,
  findListViewByName,
  HIGHLIGHT_DEMO_DATASET_FACTORIES,
  IDENTIFY_DEMO_DATASET_FACTORIES,
  IDENTIFY_PRESENT_DEMO_DATASET_FACTORIES,
  LIST_DEMO_DATASET_FACTORIES,
  loadDemoDatasets,
  MENU_DEMO_DATASET_FACTORIES,
  type DataManagementPart,
} from '@hungpvq/demo-map-datasets';
import type { IDataset } from '@hungpvq/map-dataset';
import type { MenuItemProps } from '@hungpvq/map-dataset/menu';
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

export async function loadIdentifyPresentDemoDatasets(mapId: string) {
  await loadDemoDatasets(
    addForMap(mapId),
    [...IDENTIFY_PRESENT_DEMO_DATASET_FACTORIES],
  );
}

export async function loadHighlightDemoDatasets(mapId: string) {
  await loadDemoDatasets(addForMap(mapId), [...HIGHLIGHT_DEMO_DATASET_FACTORIES]);
}

export async function loadAllMapDatasets(mapId: string) {
  await loadDemoDatasets(addForMap(mapId), [...ALL_MAP_DATASET_FACTORIES]);
}

export type DataManagementDemoLoadResult = {
  loaded: IDataset[];
  standardHttp?: DataManagementPart;
  customHttp?: DataManagementPart;
  lists: {
    http: IDataset | undefined;
    httpCustom: IDataset | undefined;
    localGeojson: IDataset | undefined;
    localList: IDataset | undefined;
    memory: IDataset | undefined;
  };
};

export async function loadDataManagementDemoDatasets(
  mapId: string,
): Promise<DataManagementDemoLoadResult> {
  const loaded: IDataset[] = [];
  await loadDemoDatasets(async (dataset) => {
    loaded.push(dataset);
    await addDatasetToMap(mapId, dataset);
  }, [...DATA_MANAGEMENT_DEMO_DATASET_FACTORIES]);

  const standardRoot = loaded.find(
    (d) => d.getName() === DATA_MANAGEMENT_HTTP_DATASET_NAME,
  );
  const customRoot = loaded.find(
    (d) => d.getName() === DATA_MANAGEMENT_HTTP_CUSTOM_DATASET_NAME,
  );
  return {
    loaded,
    standardHttp: standardRoot
      ? findDataManagementPart(standardRoot)
      : undefined,
    customHttp: customRoot ? findDataManagementPart(customRoot) : undefined,
    lists: {
      http: findListViewByName(loaded, DATA_MANAGEMENT_HTTP_LIST_NAME),
      httpCustom: findListViewByName(
        loaded,
        DATA_MANAGEMENT_HTTP_CUSTOM_LIST_NAME,
      ),
      localGeojson: findListViewByName(
        loaded,
        DATA_MANAGEMENT_LOCAL_GEOJSON_LIST_NAME,
      ),
      localList: findListViewByName(loaded, DATA_MANAGEMENT_LOCAL_LIST_NAME),
      memory: findListViewByName(loaded, DATA_MANAGEMENT_MEMORY_LIST_NAME),
    },
  };
}
