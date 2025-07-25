import type { Color } from '@hungpvq/shared-map';
import { getChartRandomColor } from '@hungpvq/vue-map-core';
import type { GeoJSON } from 'geojson';
import {
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
} from '../extra';
import type { IDataset, IListViewUI } from '../interfaces';
import type { DatasetComposite } from '../model';
import {
  createDataManagementMapboxComponent,
  createDataset,
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartListViewUiComponent,
  createIdentifyMapboxComponent,
  createMultiMapboxLayerComponent,
} from '../model';
import {
  LayerSimpleMapboxBuild,
  type LayerStyleType,
} from '../utils/layer-simple-builder';
export type GeojsonDatasetOption = {
  name: string;
  geojson: GeoJSON;
  type: LayerStyleType;
  color?: Color;
};
export function createGeoJsonDataset(data: GeojsonDatasetOption): IDataset {
  const dataset = createDataset(data.name, null, true) as DatasetComposite;

  const list: IListViewUI = createDatasetPartListViewUiComponent(data.name);
  list.color = data.color || getChartRandomColor();
  const groupLayer = createDataset(data.name, null, true) as DatasetComposite;

  const layer = createMultiMapboxLayerComponent(data.name, [
    new LayerSimpleMapboxBuild()
      .setStyleType(data.type)
      .setColor(list.color)
      .setOpacity(list.opacity)
      .build(),
  ]);
  groupLayer.add(layer);
  groupLayer.add(list);
  const dataConvert = convertGeojsonToList(data.geojson);
  const dataManagement = createDataManagementMapboxComponent(data.name, {
    fields: dataConvert.fields,
  });
  dataManagement.setItems(dataConvert.items);
  const identify = createIdentifyMapboxComponent(data.name);
  identify.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(),
  ]);
  const source = createDatasetPartGeojsonSourceComponent(data.name, {
    type: 'FeatureCollection',
    features: [],
  });
  dataset.add(source);
  dataset.add(dataManagement);
  dataset.add(groupLayer);
  dataset.add(identify);
  return dataset;
}
function convertGeojsonToList(geojson: GeoJSON): {
  items: any[];
  fields: { text: string; value: string }[];
} {
  const items: any[] = [];
  const fieldSet: Set<string> = new Set();

  const processFeature = (feature: any) => {
    const { properties = {}, geometry } = feature;
    // Thu thập tất cả các key trong properties
    Object.keys(properties).forEach((key) => fieldSet.add(key));
    return {
      ...properties,
      geometry,
    };
  };

  if (geojson.type === 'FeatureCollection') {
    for (const feature of geojson.features) {
      items.push(processFeature(feature));
    }
  } else if (geojson.type === 'Feature') {
    items.push(processFeature(geojson));
  }

  const fields = Array.from(fieldSet).map((key) => ({
    text: key,
    value: key,
  }));

  return { items, fields };
}
