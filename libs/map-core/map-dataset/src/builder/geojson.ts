import type { Color } from '@hungpvq/map-core';
import { bboxFromGeojson, getChartRandomColor, reprojectGeojsonToWgs84, toPlainJson } from '@hungpvq/map-core';
import type { GeoJSON } from 'geojson';
import type { IDataset } from '../interfaces';
import { createDatasetPartGeojsonSourceComponent } from '../model/source';
import { createDatasetPartListViewUiComponent } from '../model/list';
import { createGroupDataset, createRootDataset } from '../model/dataset.base';
import { createMultiMapboxLayerComponent } from '../model/layer';
import { createDatasetPartMetadataComponent } from '../model/part-metadata.model';
import { LayerSimpleMapboxBuild } from '../utils';
import type { FieldFeaturesDef } from '../extra/field';
import type { LayerStyleType } from '../utils/layer-simple-builder';
import {
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
} from '../extra/menu/items';
import { createIdentifyMapboxComponent } from '../model/identify';
export type GeojsonDatasetOption = {
  name: string;
  geojson: GeoJSON;
  type: LayerStyleType;
  crs?: string;
  color?: Color;
  opacity?: number;
};
export function createGeoJsonDataset(data: GeojsonDatasetOption): IDataset {
  const geojson = toPlainJson(
    data.crs ? reprojectGeojsonToWgs84(data.geojson, data.crs) : data.geojson,
  );
  const dataset = createRootDataset(data.name);

  const list = createDatasetPartListViewUiComponent(data.name);
  list.color = data.color || getChartRandomColor();
  if (data.opacity != null) {
    list.opacity = data.opacity;
  }
  const bbox = bboxFromGeojson(geojson);
  const listMenus = [createMenuItemToggleShow()];
  if (bbox) {
    dataset.add(createDatasetPartMetadataComponent(data.name, { bbox }));
    listMenus.push(createMenuItemToBoundActionForList({ bbox }));
  }
  list.addMenus(listMenus);
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
  const dataConvert = convertGeojsonToList(geojson);
  const identify = createIdentifyMapboxComponent(data.name);
  identify.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(dataConvert.fields),
  ]);
  const source = createDatasetPartGeojsonSourceComponent(
    data.name,
    geojson,
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
