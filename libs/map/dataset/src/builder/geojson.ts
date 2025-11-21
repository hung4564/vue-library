import type { Color } from '@hungpvq/shared-map';
import { getChartRandomColor } from '@hungpvq/vue-map-core';
import type { GeoJSON } from 'geojson';
import {
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
  type FieldFeaturesDef,
} from '../extra';
import type { IDataset } from '../interfaces';
import {
  createDatasetPartGeojsonSourceComponent,
  createDatasetPartListViewUiComponent,
  createGroupDataset,
  createIdentifyMapboxComponent,
  createMultiMapboxLayerComponent,
  createRootDataset,
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
  const dataset = createRootDataset(data.name);

  const list = createDatasetPartListViewUiComponent(data.name);
  list.color = data.color || getChartRandomColor();
  const groupLayer = createGroupDataset(data.name);

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
  const identify = createIdentifyMapboxComponent(data.name);
  identify.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(dataConvert.fields),
  ]);
  const source = createDatasetPartGeojsonSourceComponent(
    data.name,
    data.geojson,
  );
  dataset.add(source);
  dataset.add(groupLayer);
  dataset.add(identify);
  return dataset;
}
function convertGeojsonToList(geojson: GeoJSON): {
  items: any[];
  fields: FieldFeaturesDef;
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
