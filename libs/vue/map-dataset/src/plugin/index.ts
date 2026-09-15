import { registerDatasetRegistryComponents } from '@hungpvq/map-dataset/menu';
import { bootstrapMapTheme } from '@hungpvq/map-core/theme';
import { UniversalRegistry } from '@hungpvq/vue-map-core';
import type { App, Plugin } from 'vue';
import LayerItemIcon from '../extra/component/layer-item-icon.vue';
import AddToGroup from '../extra/component/add-to-group.vue';
import ExportGeo from '../extra/component/export-geo.vue';
import ExportGeoFormatMenu from '../extra/component/export-geo-menu.vue';
import IdentifyLayerAction from '../extra/component/identify.vue';
import SetOpacity from '../extra/component/set-opacity.vue';
import ToggleShowButton from '../extra/component/toggle-show-button.vue';
import ToggleShow from '../extra/component/toggle-show.vue';
import AttributeTable from '../modules/AttributeTable/AttributeTable.vue';
import AttributeTableGrid from '../modules/AttributeTable/AttributeTableGrid.vue';
import AttributeTablePager from '../modules/AttributeTable/AttributeTablePager.vue';
import AttributeTableToolbar from '../modules/AttributeTable/AttributeTableToolbar.vue';
import AttributeTableView from '../modules/AttributeTable/AttributeTableView.vue';
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
      registerDatasetRegistryComponents(
        UniversalRegistry.registerComponent.bind(UniversalRegistry),
        {
          legendLinear: LayerLegendLinearGradient,
          legendColor: LayerLegendSingleColor,
          legendText: LayerLegendSingleText,
          legendMulti: MultiLegend,
          layerIcon: LayerItemIcon,
          layerDetail: LayerDetail,
          styleControl: StyleControl,
          datasetDetail: DatasetDetail,
          styleMultiControl: MultiStyle,
          toggleShow: ToggleShow,
          toggleShowButton: ToggleShowButton,
          setOpacity: SetOpacity,
          addToGroup: AddToGroup,
          exportGeo: ExportGeo,
          exportGeoMenu: ExportGeoFormatMenu,
          identify: IdentifyLayerAction,
          attributeTable: AttributeTable,
          attributeTableView: AttributeTableView,
          attributeTableToolbar: AttributeTableToolbar,
          attributeTablePager: AttributeTablePager,
          attributeTableGrid: AttributeTableGrid,
        },
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
 * One-call DX bootstrap for Vue map apps (theme + dataset registry).
 * Still import CSS once in the app entry.
 */
export function installMapApp(
  app: App,
  options: InstallMapAppOptions = {},
): App {
  if (options.theme !== false) {
    bootstrapMapTheme();
  }
  if (options.dataset !== false) {
    app.use(createDatasetRegistryPlugin());
  }
  return app;
}

/** Vue plugin wrapper around {@link installMapApp}. */
export function createMapAppPlugin(
  options: InstallMapAppOptions = {},
): Plugin {
  return {
    install(app) {
      installMapApp(app, options);
    },
  };
}
