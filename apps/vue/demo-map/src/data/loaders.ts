import { createDemoLoaders } from '@hungpvq/demo-map-datasets';
import type { MenuItemProps } from '@hungpvq/map-dataset/menu';
import { UniversalRegistry } from '@hungpvq/vue-map-core';

import { addDatasetToMap } from './dataset-utils';

const loaders = createDemoLoaders({
  addDatasetToMap,
  registerMenuHandler: (key, handler) => {
    UniversalRegistry.registerMenuHandler(key, (props) => {
      handler(props as MenuItemProps);
    });
  },
});

export const {
  loadListDemoDatasets,
  loadMenuDemoDatasets,
  loadIdentifyDemoDatasets,
  loadIdentifyPresentDemoDatasets,
  loadHighlightDemoDatasets,
  loadGeoExportDemoDatasets,
  loadAllMapDatasets,
  loadDataManagementDemoDatasets,
} = loaders;
