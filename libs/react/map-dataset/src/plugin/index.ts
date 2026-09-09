import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
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
    },
  };
}
