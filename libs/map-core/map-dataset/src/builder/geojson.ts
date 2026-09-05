import type { Color, GeojsonBbox } from '@hungpvq/map-core';
import {
  bboxFromGeojson,
  getChartRandomColor,
  MapError,
  reprojectGeojsonToWgs84,
  toPlainJson,
} from '@hungpvq/map-core';
import type { Feature, GeoJSON, Geometry } from 'geojson';
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
  detectGeojsonStyleTypes,
  isGeojsonStyleAuto,
  styleTypeToMapboxGeometryType,
  type GeojsonStyleMode,
} from '../extra/create-control/geojson-parse';
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
  /**
   * `point` | `line` | `area` = single layer (legacy).
   * `auto` = one layer per geometry type found in the data.
   * Optional `styles` overrides detection when already resolved (e.g. via worker).
   */
  type?: GeojsonStyleMode;
  /** Precomputed styles (from worker); used when `type` is `auto`. */
  styles?: LayerStyleType[];
  /** Precomputed Turf bbox from worker/main; skips sync bbox when set. */
  bbox?: GeojsonBbox | null;
  crs?: string;
  color?: Color;
  opacity?: number;
};

function buildSingleStyleLayer(
  style: LayerStyleType,
  color: Color,
  opacity?: number,
  withFilter = false,
) {
  const builder = new LayerSimpleMapboxBuild()
    .setStyleType(style)
    .setColor(color)
    .setOpacity(style === 'area' ? opacity ?? 0.5 : opacity ?? 1);
  if (withFilter) {
    const mapboxType = styleTypeToMapboxGeometryType(style);
    if (mapboxType) {
      builder.setFilter(['==', '$type', mapboxType]);
    }
  }
  return builder.build();
}

function resolveStyleLayers(
  geojson: GeoJSON,
  type: GeojsonStyleMode | undefined,
  styles: LayerStyleType[] | undefined,
  color: Color,
  opacity?: number,
) {
  if (styles && styles.length > 0) {
    return styles.map((style) =>
      buildSingleStyleLayer(style, color, opacity, true),
    );
  }

  if (isGeojsonStyleAuto(type)) {
    return detectGeojsonStyleTypes(geojson).map((style) =>
      buildSingleStyleLayer(style, color, opacity, true),
    );
  }

  return [buildSingleStyleLayer(type ?? 'point', color, opacity, false)];
}

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
  const bbox =
    data.bbox === null
      ? undefined
      : data.bbox ?? bboxFromGeojson(geojson);
  const listMenus = [createMenuItemToggleShow()];
  if (bbox) {
    dataset.add(createDatasetPartMetadataComponent(data.name, { bbox }));
    listMenus.push(createMenuItemToBoundActionForList({ bbox }));
  }
  list.addMenus(listMenus);
  const groupLayer = createGroupDataset(data.name);

  let layer;
  try {
    layer = createMultiMapboxLayerComponent(
      data.name,
      resolveStyleLayers(
        geojson,
        data.type,
        data.styles,
        list.color,
        list.opacity,
      ),
    );
  } catch (error) {
    throw error instanceof MapError
      ? error
      : new MapError(
          error instanceof Error ? error.message : 'Failed to build style layers',
          'LAYER_CREATE_ERROR',
          { recoverable: false, cause: error, context: { stage: 'build-layers' } },
        );
  }
  groupLayer.add(layer);
  groupLayer.add(list);
  const dataConvert = convertGeojsonToList(geojson);
  const identify = createIdentifyMapboxComponent(data.name);
  identify.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(dataConvert.fields),
  ]);
  const source = createDatasetPartGeojsonSourceComponent(data.name, geojson);
  dataset.add(source);
  dataset.add(groupLayer);
  dataset.add(identify);
  return dataset;
}
type GeojsonListItem = Record<string, unknown> & {
  geometry?: Geometry | null;
};

function convertGeojsonToList(geojson: GeoJSON): {
  items: GeojsonListItem[];
  fields: FieldFeaturesDef;
} {
  const items: GeojsonListItem[] = [];
  const fieldSet: Set<string> = new Set();

  const processFeature = (feature: Feature): GeojsonListItem => {
    const properties = (feature.properties ?? {}) as Record<string, unknown>;
    Object.keys(properties).forEach((key) => fieldSet.add(key));
    return {
      ...properties,
      geometry: feature.geometry,
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
