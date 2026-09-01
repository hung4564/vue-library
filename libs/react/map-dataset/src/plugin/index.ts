import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset';
import { UniversalRegistry } from '@hungpvq/react-map-core';
import { AddToGroup, LayerItemIcon, SetOpacity, ToggleShow } from '../extra/component';
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
        'legend-linear',
        LayerLegendLinearGradient,
      );
      UniversalRegistry.registerComponent(
        'legend-color',
        LayerLegendSingleColor,
      );
      UniversalRegistry.registerComponent('legend-text', LayerLegendSingleText);
      UniversalRegistry.registerComponent('legend-multi', MultiLegend);
      UniversalRegistry.registerComponent('layer-icon', LayerItemIcon);
      UniversalRegistry.registerComponent('layer-detail', LayerDetail);
      UniversalRegistry.registerComponent('dataset-detail', DatasetDetail);
      UniversalRegistry.registerComponent('style-control', StyleControl);
      UniversalRegistry.registerComponent('style-multi-control', MultiStyle);
      UniversalRegistry.registerComponent(
        'layer-action-toggle-show',
        ToggleShow,
      );
      UniversalRegistry.registerComponent(
        'layer-action-set-opacity',
        SetOpacity,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.addToGroup,
        AddToGroup,
      );
    },
  };
}
