import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { bootstrapMapTheme } from '@hungpvq/map-core/theme';
import { UniversalRegistry } from '@hungpvq/react-map-core';
import {
  AddToGroup,
  ExportGeo,
  IdentifyLayerAction,
  LayerItemIcon,
  SetOpacity,
  ToggleShow,
  ToggleShowButton,
} from '../extra/component';
import { AttributeTable } from '../modules/AttributeTable/AttributeTable';
import { AttributeTableGrid } from '../modules/AttributeTable/AttributeTableGrid';
import { AttributeTablePager } from '../modules/AttributeTable/AttributeTablePager';
import { AttributeTableToolbar } from '../modules/AttributeTable/AttributeTableToolbar';
import { AttributeTableView } from '../modules/AttributeTable/AttributeTableView';
import { DatasetDetail } from '../modules/DatasetControl/DatasetControl';
import { LayerDetail } from '../modules/LayerDetail/LayerDetail';
import {
  LayerLegendLinearGradient,
  LayerLegendSingleColor,
  LayerLegendSingleText,
  MultiLegend,
} from '../modules/Legend';
import { StyleControl } from '../modules/StyleControl/StyleControl';
import { MultiStyle } from '../modules/StyleControl/style/MultiStyle';

export function createDatasetRegistryPlugin() {
  return {
    install() {
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.legendLinear,
        LayerLegendLinearGradient,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.legendColor,
        LayerLegendSingleColor,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.legendText,
        LayerLegendSingleText,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.legendMulti,
        MultiLegend,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.layerIcon,
        LayerItemIcon,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.layerDetail,
        LayerDetail,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.datasetDetail,
        DatasetDetail,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.styleControl,
        StyleControl,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.styleMultiControl,
        MultiStyle,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.toggleShow,
        ToggleShow,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.toggleShowButton,
        ToggleShowButton,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.setOpacity,
        SetOpacity,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.addToGroup,
        AddToGroup,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.exportGeo,
        ExportGeo,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.identify,
        IdentifyLayerAction,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.attributeTable,
        AttributeTable,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.attributeTableView,
        AttributeTableView,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.attributeTableToolbar,
        AttributeTableToolbar,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.attributeTablePager,
        AttributeTablePager,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.attributeTableGrid,
        AttributeTableGrid,
      );
    },
  };
}

export type InstallMapAppOptions = {
  /** Register dataset UI components (default `true`). */
  dataset?: boolean;
  /** Call `bootstrapMapTheme()` (default `true`). */
  theme?: boolean;
};

/**
 * One-call DX bootstrap for React map apps (theme + dataset registry).
 * Still import CSS once in the app entry.
 */
export function installMapApp(options: InstallMapAppOptions = {}): void {
  if (options.theme !== false) {
    bootstrapMapTheme();
  }
  if (options.dataset !== false) {
    createDatasetRegistryPlugin().install();
  }
}
