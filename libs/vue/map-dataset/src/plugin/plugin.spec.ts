import { describe, expect, it } from 'vitest';
import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset';
import { UniversalRegistry } from '@hungpvq/vue-map-core';
import { createDatasetRegistryPlugin } from './index';

const REGISTERED_KEYS = [
  LIST_VIEW_MENU_COMPONENT_KEY.legendLinear,
  LIST_VIEW_MENU_COMPONENT_KEY.legendColor,
  LIST_VIEW_MENU_COMPONENT_KEY.legendText,
  LIST_VIEW_MENU_COMPONENT_KEY.legendMulti,
  LIST_VIEW_MENU_COMPONENT_KEY.layerIcon,
  LIST_VIEW_MENU_COMPONENT_KEY.layerDetail,
  LIST_VIEW_MENU_COMPONENT_KEY.styleControl,
  LIST_VIEW_MENU_COMPONENT_KEY.datasetDetail,
  LIST_VIEW_MENU_COMPONENT_KEY.styleMultiControl,
  LIST_VIEW_MENU_COMPONENT_KEY.toggleShow,
  LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton,
  LIST_VIEW_MENU_COMPONENT_KEY.setOpacity,
  LIST_VIEW_MENU_COMPONENT_KEY.addToGroup,
  LIST_VIEW_MENU_COMPONENT_KEY.exportGeo,
  LIST_VIEW_MENU_COMPONENT_KEY.identify,
  LIST_VIEW_MENU_COMPONENT_KEY.attributeTable,
] as const;

describe('createDatasetRegistryPlugin', () => {
  it('registers dataset UI components on UniversalRegistry', () => {
    createDatasetRegistryPlugin().install();
    for (const key of REGISTERED_KEYS) {
      expect(UniversalRegistry.getComponent(key), key).toBeTruthy();
    }
  });
});
