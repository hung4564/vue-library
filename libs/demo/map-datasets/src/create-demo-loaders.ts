import type { IDataset } from '@hungpvq/map-dataset';
import type { MenuItemProps } from '@hungpvq/map-dataset/menu';
import { loggerFactory } from '@hungpvq/shared-log';
import { ALL_MAP_DATASET_FACTORIES } from './datasets/all-map';
import {
  DATA_MANAGEMENT_DEMO_DATASET_FACTORIES,
  DATA_MANAGEMENT_HTTP_CUSTOM_DATASET_NAME,
  DATA_MANAGEMENT_HTTP_CUSTOM_LIST_NAME,
  DATA_MANAGEMENT_HTTP_DATASET_NAME,
  DATA_MANAGEMENT_HTTP_LIST_NAME,
  DATA_MANAGEMENT_LOCAL_GEOJSON_LIST_NAME,
  DATA_MANAGEMENT_LOCAL_LIST_NAME,
  DATA_MANAGEMENT_MEMORY_LIST_NAME,
  findDataManagementPart,
  findListViewByName,
  type DataManagementPart,
} from './datasets/data-management';
import {
  createGeoExportOverrideUiDataset,
  GEO_EXPORT_DEMO_DATASET_FACTORIES,
} from './datasets/geo-export';
import { HIGHLIGHT_DEMO_DATASET_FACTORIES } from './datasets/highlight';
import { IDENTIFY_DEMO_DATASET_FACTORIES } from './datasets/identify';
import { IDENTIFY_PRESENT_DEMO_DATASET_FACTORIES } from './datasets/identify-present';
import { LIST_DEMO_DATASET_FACTORIES } from './datasets/list';
import { MENU_DEMO_DATASET_FACTORIES } from './datasets/menu';
import { loadDemoDatasets } from './loaders/types';
import { DEMO_CUSTOM_MENU_HANDLER_KEY } from './registry/menu-handlers';

const logger = loggerFactory
  .createLogger()
  .setNamespace('demo:menu-handler', 2);

export type DemoLoaderDeps = {
  addDatasetToMap: (
    mapId: string,
    dataset: IDataset,
  ) => void | Promise<void>;
  registerMenuHandler: (
    key: string,
    handler: (props: MenuItemProps) => void,
  ) => void;
};

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

/**
 * Framework-agnostic demo dataset loaders. Apps pass store + registry glue.
 */
export function createDemoLoaders(deps: DemoLoaderDeps) {
  let menuHandlerRegistered = false;

  function ensureCustomMenuHandler() {
    if (menuHandlerRegistered) return;
    menuHandlerRegistered = true;
    deps.registerMenuHandler(DEMO_CUSTOM_MENU_HANDLER_KEY, (props) => {
      logger
        .with({ fn: 'ensureCustomMenuHandler', span: 'menu.action' })
        .info('custom-menu-handle in registry', props);
    });
  }

  function addForMap(mapId: string) {
    return (dataset: IDataset) => deps.addDatasetToMap(mapId, dataset);
  }

  return {
    async loadListDemoDatasets(mapId: string) {
      await loadDemoDatasets(addForMap(mapId), [...LIST_DEMO_DATASET_FACTORIES]);
    },
    async loadMenuDemoDatasets(mapId: string) {
      ensureCustomMenuHandler();
      await loadDemoDatasets(addForMap(mapId), [...MENU_DEMO_DATASET_FACTORIES]);
    },
    async loadIdentifyDemoDatasets(mapId: string) {
      await loadDemoDatasets(addForMap(mapId), [
        ...IDENTIFY_DEMO_DATASET_FACTORIES,
      ]);
    },
    async loadIdentifyPresentDemoDatasets(mapId: string) {
      await loadDemoDatasets(addForMap(mapId), [
        ...IDENTIFY_PRESENT_DEMO_DATASET_FACTORIES,
      ]);
    },
    async loadHighlightDemoDatasets(mapId: string) {
      await loadDemoDatasets(addForMap(mapId), [
        ...HIGHLIGHT_DEMO_DATASET_FACTORIES,
      ]);
    },
    async loadGeoExportDemoDatasets(
      mapId: string,
      overrideUi?: { formComponent?: unknown; loadingComponent?: unknown },
    ) {
      await loadDemoDatasets(addForMap(mapId), [
        ...GEO_EXPORT_DEMO_DATASET_FACTORIES,
        () => createGeoExportOverrideUiDataset(overrideUi),
      ]);
    },
    async loadAllMapDatasets(mapId: string) {
      await loadDemoDatasets(addForMap(mapId), [...ALL_MAP_DATASET_FACTORIES]);
    },
    async loadDataManagementDemoDatasets(
      mapId: string,
    ): Promise<DataManagementDemoLoadResult> {
      const loaded: IDataset[] = [];
      await loadDemoDatasets(async (dataset) => {
        loaded.push(dataset);
        await deps.addDatasetToMap(mapId, dataset);
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
        customHttp: customRoot
          ? findDataManagementPart(customRoot)
          : undefined,
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
    },
  };
}
