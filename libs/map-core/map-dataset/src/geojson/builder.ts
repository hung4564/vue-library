import type { Color, GeojsonBbox } from '@hungpvq/map-core';
import {
  bboxFromGeojson,
  getChartColorAt,
  getChartRandomColor,
  MapError,
  reprojectGeojsonToWgs84,
  toPlainJson,
} from '@hungpvq/map-core';
import type { Feature, FeatureCollection, GeoJSON, Geometry } from 'geojson';
import { createMenuItemAttributeTable } from '../attribute-table/menu';
import type { FieldFeaturesDef } from '../extra/field';
import { createMenuItemExportGeo } from '../geo-export';
import { createIdentifyMapboxComponent } from '../identify';
import type { IDataset, WithChildren } from '../interfaces/dataset.base';
import {
  createMenuItemIdentifyForList,
  createMenuItemShowDetailForItem,
  createMenuItemToBoundActionForItem,
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
} from '../menu/items';
import { createGroupDataset, createRootDataset } from '../model/dataset.base';
import { createMultiMapboxLayerComponent } from '../model/layer/model';
import {
  createDatasetPartGroupSubListViewUiComponentBuilder,
  createDatasetPartSubListViewUiComponentBuilder,
} from '../model/list/builder';
import { createDatasetPartListViewUiComponent } from '../model/list/model';
import { createDatasetPartBoundComponent } from '../model/part-bound.model';
import type { LayerStyleType } from '../style/layer-simple-builder';
import {
  buildAutoVectorTileStyleLayers,
  buildSimpleStyleLayers,
} from '../style/layer-simple-builder';
import { ensureGeojsonFeatureIds, GEOJSON_FEATURE_ID_KEY } from './feature-id';
import {
  detectGeojsonStyleTypes,
  GEOJSON_STYLE_AUTO,
  isGeojsonStyleAuto,
  type GeojsonStyleMode,
} from './geojson-parse';
import { createDatasetPartGeojsonSourceComponent } from './source';

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
  /**
   * Map style opacity (`fill-opacity`, `circle-opacity`, …).
   * The layer-item slider stays at 1 and multiplies this value when dragged.
   */
  opacity?: number;
  /** Add list ⋮ Export. Default `true`. */
  export?: boolean;
  /** Add list ⋮ Attribute table. Default `true`. */
  attributeTable?: boolean;
};

function resolveStyleLayers(
  geojson: GeoJSON,
  type: GeojsonStyleMode | undefined,
  styles: LayerStyleType[] | undefined,
  color: Color,
  opacity?: number,
) {
  if (styles && styles.length > 0) {
    return styles.flatMap((style) =>
      buildSimpleStyleLayers(style, color, opacity, { withTypeFilter: true }),
    );
  }

  if (isGeojsonStyleAuto(type)) {
    return detectGeojsonStyleTypes(geojson).flatMap((style) =>
      buildSimpleStyleLayers(style, color, opacity, { withTypeFilter: true }),
    );
  }

  return buildSimpleStyleLayers(type ?? 'point', color, opacity, {
    withTypeFilter: false,
  });
}

export function createGeoJsonDataset(data: GeojsonDatasetOption): IDataset {
  const raw = toPlainJson(
    data.crs ? reprojectGeojsonToWgs84(data.geojson, data.crs) : data.geojson,
  );
  // Stamp stable _id before source/identify/AT so zoom-skewed MapLibre
  // coordinates are not the only select key (World Cities, etc.).
  const geojson = ensureGeojsonFeatureIds(raw);
  const dataset = createRootDataset(data.name);

  const list = createDatasetPartListViewUiComponent(data.name);
  list.color = data.color || getChartRandomColor();
  const bbox =
    data.bbox === null ? undefined : (data.bbox ?? bboxFromGeojson(geojson));
  const listMenus = [
    createMenuItemToggleShow(),
    createMenuItemIdentifyForList(),
  ];
  if (data.export !== false) {
    listMenus.push(createMenuItemExportGeo());
  }
  if (data.attributeTable !== false) {
    listMenus.push(createMenuItemAttributeTable());
  }
  if (bbox) {
    dataset.add(createDatasetPartBoundComponent(data.name, bbox));
    listMenus.push(createMenuItemToBoundActionForList());
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
        data.opacity,
      ),
    );
  } catch (error) {
    throw error instanceof MapError
      ? error
      : new MapError(
          error instanceof Error
            ? error.message
            : 'Failed to build style layers',
          'LAYER_CREATE_ERROR',
          {
            recoverable: false,
            cause: error,
            context: { stage: 'build-layers' },
          },
        );
  }
  groupLayer.add(layer);
  groupLayer.add(list);
  const dataConvert = convertGeojsonToList(geojson);
  const identify = createIdentifyMapboxComponent('Identify ' + data.name, {
    field_id: GEOJSON_FEATURE_ID_KEY,
    field_name: 'name',
    onMultiple: 'auto',
    onSingle: 'auto',
  });
  identify.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(dataConvert.fields),
  ]);
  const source = createDatasetPartGeojsonSourceComponent(data.name, geojson, {
    promoteId: GEOJSON_FEATURE_ID_KEY,
  });
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

/** One FileGDB / multi-FC slice (MBTiles-like source-layer). */
export type GeojsonLayerPart = {
  name: string;
  geojson: GeoJSON;
  type?: GeojsonStyleMode;
  styles?: LayerStyleType[];
  bbox?: GeojsonBbox | null;
  color?: Color;
};

export type GeojsonLayersDatasetOption = {
  name: string;
  layers: GeojsonLayerPart[];
  /** Default style mode for parts that omit `type`. Default `auto`. */
  type?: GeojsonStyleMode;
  color?: Color;
  opacity?: number;
  export?: boolean;
  attributeTable?: boolean;
  /** Overall parent bbox; derived from layer bboxes when omitted. */
  bbox?: GeojsonBbox | null;
};

function resolveLayerBbox(
  geojson: GeoJSON,
  bbox: GeojsonBbox | null | undefined,
): GeojsonBbox | undefined {
  if (bbox === null) return undefined;
  if (bbox) return bbox;
  try {
    return bboxFromGeojson(geojson);
  } catch {
    return undefined;
  }
}

function unionBboxes(boxes: GeojsonBbox[]): GeojsonBbox | undefined {
  if (!boxes.length) return undefined;
  return boxes.reduce(
    (acc, box) => [
      Math.min(acc[0], box[0]),
      Math.min(acc[1], box[1]),
      Math.max(acc[2], box[2]),
      Math.max(acc[3], box[3]),
    ],
    boxes[0],
  );
}

function buildLayerPaint(
  geojson: GeoJSON,
  type: GeojsonStyleMode | undefined,
  styles: LayerStyleType[] | undefined,
  color: Color,
  opacity?: number,
) {
  // MBTiles-like auto: always area(+outline) + line + point with type filters.
  if (isGeojsonStyleAuto(type) && !(styles && styles.length > 0)) {
    return buildAutoVectorTileStyleLayers(color, opacity);
  }
  return resolveStyleLayers(geojson, type, styles, color, opacity);
}

function attachGeojsonLayerParts(
  parent: IDataset & WithChildren,
  part: GeojsonLayerPart,
  index: number,
  defaults: {
    type: GeojsonStyleMode;
    opacity?: number;
    export?: boolean;
    attributeTable?: boolean;
  },
) {
  const raw = toPlainJson(part.geojson);
  const geojson = ensureGeojsonFeatureIds(raw);
  const name = part.name.trim() || `Layer ${index + 1}`;
  // Per feature-class chart color (ignore shared form color), same as MBTiles.
  const color = getChartColorAt(index) || getChartRandomColor();
  const styleMode = part.type ?? defaults.type;
  const layerBbox = resolveLayerBbox(geojson, part.bbox);

  const listMenus = [
    createMenuItemToggleShow(),
    createMenuItemIdentifyForList(),
  ];
  if (defaults.export !== false) {
    listMenus.push(createMenuItemExportGeo());
  }
  if (defaults.attributeTable !== false) {
    listMenus.push(createMenuItemAttributeTable());
  }
  if (layerBbox) {
    listMenus.push(createMenuItemToBoundActionForList());
  }

  const list = createDatasetPartSubListViewUiComponentBuilder(name)
    .setColor(color)
    .addMenus(listMenus)
    .build();

  const groupLayer = createGroupDataset(name);

  // Source must precede paint layers so DatasetService BFS addToMap registers
  // the MapLibre source before addLayer (same order as createGeoJsonDataset).
  const source = createDatasetPartGeojsonSourceComponent(name, geojson, {
    promoteId: GEOJSON_FEATURE_ID_KEY,
  });
  groupLayer.add(source);
  groupLayer.add(list);
  groupLayer.add(
    createMultiMapboxLayerComponent(
      name,
      buildLayerPaint(
        geojson,
        styleMode,
        // Auto path ignores precomputed styles (MBTiles expands all types).
        isGeojsonStyleAuto(styleMode) ? undefined : part.styles,
        list.color ?? color,
        defaults.opacity,
      ),
    ),
  );

  const dataConvert = convertGeojsonToList(geojson);
  const identify = createIdentifyMapboxComponent(`Identify ${name}`, {
    field_id: GEOJSON_FEATURE_ID_KEY,
    field_name: 'name',
    onMultiple: 'auto',
    onSingle: 'auto',
  });
  identify.addMenus([
    createMenuItemToBoundActionForItem(),
    createMenuItemShowDetailForItem(dataConvert.fields),
  ]);
  groupLayer.add(identify);

  if (layerBbox) {
    groupLayer.add(createDatasetPartBoundComponent(name, layerBbox));
  }

  parent.add(groupLayer);

  return layerBbox;
}

/**
 * Build a root dataset from one or more GeoJSON slices (FileGDB feature classes).
 *
 * - **1 layer** → same list shape as {@link createGeoJsonDataset}
 * - **2+ layers** → one parent GroupSubList (master checkbox + fillbound) and each
 *   slice as a SubList (MBTiles / vector-tile pattern)
 */
export function createGeoJsonLayersDataset(
  data: GeojsonLayersDatasetOption,
): IDataset {
  const layers = (data.layers ?? []).filter((layer) => layer?.geojson);
  if (!layers.length) {
    throw new MapError('No GeoJSON layers to create', 'LAYER_CREATE_ERROR', {
      recoverable: false,
      context: { stage: 'build-dataset' },
    });
  }

  if (layers.length === 1) {
    const only = layers[0];
    return createGeoJsonDataset({
      name: data.name,
      geojson: only.geojson,
      type: only.type ?? data.type ?? GEOJSON_STYLE_AUTO,
      styles: only.styles,
      bbox: only.bbox ?? data.bbox,
      color: only.color ?? data.color,
      opacity: data.opacity,
      export: data.export,
      attributeTable: data.attributeTable,
    });
  }

  const dataset = createRootDataset(data.name);
  const styleDefault = data.type ?? GEOJSON_STYLE_AUTO;
  // Multi-layer FileGDB path always uses MBTiles-like auto expand.
  const paintMode = isGeojsonStyleAuto(styleDefault)
    ? GEOJSON_STYLE_AUTO
    : styleDefault;
  const layerBboxes: GeojsonBbox[] = [];

  const parentColor = data.color || getChartColorAt(0) || getChartRandomColor();

  // Precompute layer bboxes for parent fillbound.
  for (const layer of layers) {
    const stamped = ensureGeojsonFeatureIds(toPlainJson(layer.geojson));
    const box = resolveLayerBbox(stamped, layer.bbox);
    if (box) layerBboxes.push(box);
  }
  const parentBbox =
    data.bbox === null
      ? undefined
      : (data.bbox ?? unionBboxes(layerBboxes));

  if (parentBbox) {
    dataset.add(createDatasetPartBoundComponent(data.name, parentBbox));
  }

  const parentMenus = [createMenuItemToggleShow({ location: 'bottom' })];
  if (parentBbox) {
    parentMenus.push(createMenuItemToBoundActionForList());
  }

  const parentList = createDatasetPartGroupSubListViewUiComponentBuilder(
    data.name,
  )
    .setColor(parentColor)
    .configInitShowChildren(false)
    .addMenus(parentMenus)
    .build();

  const groupLayer = createGroupDataset(data.name);
  groupLayer.add(parentList);
  dataset.add(groupLayer);

  layers.forEach((layer, index) => {
    attachGeojsonLayerParts(parentList, layer, index, {
      type: paintMode,
      opacity: data.opacity,
      export: data.export,
      attributeTable: data.attributeTable,
    });
  });

  return dataset;
}

/** Split a merged FileGDB FeatureCollection by `__gdb_layer` property. */
export function splitGeojsonByGdbLayer(
  geojson: GeoJSON,
): Array<{ name: string; geojson: FeatureCollection }> {
  if (!geojson || typeof geojson !== 'object') return [];
  const features: Feature[] =
    geojson.type === 'FeatureCollection'
      ? geojson.features ?? []
      : geojson.type === 'Feature'
        ? [geojson]
        : [];
  if (!features.length) return [];

  const buckets = new Map<string, Feature[]>();
  for (const feature of features) {
    const raw = feature.properties?.['__gdb_layer'];
    const name =
      typeof raw === 'string' && raw.trim() ? raw.trim() : 'layer';
    const list = buckets.get(name);
    if (list) list.push(feature);
    else buckets.set(name, [feature]);
  }

  return Array.from(buckets.entries()).map(([name, feats]) => ({
    name,
    geojson: { type: 'FeatureCollection', features: feats },
  }));
}

