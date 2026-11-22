import { getChartRandomColor } from '@hungpvq/map-core';
import type { MeasurementHandleType } from '@hungpvq/map-core/measurement';
import {
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMultiMapboxLayerComponent,
  createRootDataset,
} from '@hungpvq/map-dataset';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import {
  createMenuItemToggleShow,
  createMultiLegend,
} from '@hungpvq/map-dataset/menu';
import {
  LayerSimpleMapboxBuild,
  type LayerStyleType,
} from '@hungpvq/map-dataset/style';

function convertMeasureTypeToStyleType(
  measurementType: string,
): LayerStyleType {
  switch (measurementType) {
    case 'area':
      return 'area';
    case 'distance':
    case 'line':
      return 'line';
    case 'point':
      return 'point';
    default:
      return 'line';
  }
}

/** Build a root GeoJSON dataset from a measurement result (mirrors Vue AllMapView). */
export function createDatasetMeasure(
  handler: MeasurementHandleType,
  measurementType: string,
) {
  const result = handler.getResult();
  const dataset = createRootDataset('Dataset Measure');
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    // Same shape as Vue AllMapView (features may be Feature[] from getResult).
    features: (result.features || []) as GeoJSON.Feature[],
  });
  const groupLayer1 = createGroupDataset('Group layer 1');
  const list1 = createDatasetPartListViewUiComponentBuilder(
    'List Measure:' + measurementType,
  )
    .setColor(getChartRandomColor())
    .configDisabledOpacity()
    .configInitShowLegend()
    .setLegend(
      createMultiLegend([
        {
          type: 'text',
          value: {
            text: 'Measure',
            value: (result.format || result.value || 0) + '',
          },
        },
      ]),
    )
    .addMenus([createMenuItemToggleShow()])
    .build();
  const layers = [
    new LayerSimpleMapboxBuild()
      .setStyleType(convertMeasureTypeToStyleType(measurementType || 'line'))
      .setColor(list1.color)
      .build(),
  ];
  const layer1 = createMultiMapboxLayerComponent('Layer Measure', layers);
  groupLayer1.add(layer1);
  groupLayer1.add(list1);
  dataset.add(source);
  dataset.add(groupLayer1);
  return dataset;
}
