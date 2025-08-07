import { LayerItemIcon } from '../extra';
import SetOpacity from '../extra/component/set-opacity.vue';
import ToggleShow from '../extra/component/toggle-show.vue';
import DatasetDetail from '../modules/DatasetControl/DatasetDetail.vue';
import LayerDetail from '../modules/LayerDetail/LayerDetail.vue';
import {
  LayerLegendLinearGradient,
  LayerLegendSingleColor,
  LayerLegendSingleText,
  MultiLegend,
} from '../modules/Legend';
import StyleControl from '../modules/StyleControl/style-control.vue';
import MultiStyle from '../modules/StyleControl/style/multi-style.vue';
import { UniversalRegistry } from '../registry';

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
      UniversalRegistry.registerComponent('style-control', StyleControl);
      UniversalRegistry.registerComponent('dataset-detail', DatasetDetail);
      UniversalRegistry.registerComponent('style-multi-control', MultiStyle);
      UniversalRegistry.registerComponent(
        'layer-action-toggle-show',
        ToggleShow,
      );
      UniversalRegistry.registerComponent(
        'layer-action-set-opacity',
        SetOpacity,
      );
    },
  };
}
