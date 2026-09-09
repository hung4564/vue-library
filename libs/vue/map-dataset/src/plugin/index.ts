import { LIST_VIEW_MENU_COMPONENT_KEY } from '@hungpvq/map-dataset/menu';
import { UniversalRegistry } from '@hungpvq/vue-map-core';
import { LayerItemIcon } from '../extra';
import AddToGroup from '../extra/component/add-to-group.vue';
import ExportGeo from '../extra/component/export-geo.vue';
import IdentifyLayerAction from '../extra/component/identify.vue';
import SetOpacity from '../extra/component/set-opacity.vue';
import ToggleShowButton from '../extra/component/toggle-show-button.vue';
import ToggleShow from '../extra/component/toggle-show.vue';
import AttributeTable from '../modules/AttributeTable/AttributeTable.vue';
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
        LIST_VIEW_MENU_COMPONENT_KEY.styleControl,
        StyleControl,
      );
      UniversalRegistry.registerComponent(
        LIST_VIEW_MENU_COMPONENT_KEY.datasetDetail,
        DatasetDetail,
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
