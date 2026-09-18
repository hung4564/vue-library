import { bootstrapMapTheme } from '@hungpvq/map-core/theme';
import { registerDatasetRegistryComponents } from '@hungpvq/map-dataset/menu';
import { UniversalRegistry } from '@hungpvq/react-map-core';
import { AddToGroup } from '../extra/component/add-to-group';
import { ExportGeo } from '../extra/component/export-geo';
import { ExportGeoFormatMenu } from '../extra/component/export-geo-menu';
import { IdentifyLayerAction } from '../extra/component/identify';
import { LayerItemIcon } from '../extra/component/layer-item-icon';
import { SetOpacity } from '../extra/component/set-opacity';
import { ToggleShow } from '../extra/component/toggle-show';
import { ToggleShowButton } from '../extra/component/toggle-show-button';
import { AttributeTable } from '../modules/AttributeTable/AttributeTable';
import { AttributeTableGrid } from '../modules/AttributeTable/AttributeTableGrid';
import { AttributeTablePager } from '../modules/AttributeTable/AttributeTablePager';
import { AttributeTableToolbar } from '../modules/AttributeTable/AttributeTableToolbar';
import { AttributeTableView } from '../modules/AttributeTable/AttributeTableView';
import { DatasetDetail } from '../modules/DatasetControl/DatasetControl';
import { LayerDetail } from '../modules/LayerDetail/LayerDetail';
import { LayerLegendLinearGradient } from '../modules/Legend/parts/linear-gradient';
import { LayerLegendSingleColor } from '../modules/Legend/parts/single-color';
import { LayerLegendSingleText } from '../modules/Legend/parts/single-value';
import { MultiLegend } from '../modules/Legend/MultiLegend';
import { StyleControl } from '../modules/StyleControl/StyleControl';
import { MultiStyle } from '../modules/StyleControl/style/MultiStyle';

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
