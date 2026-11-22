import {
  type Color,
  getChartColorAt,
  getChartRandomColor,
} from '@hungpvq/map-core';
import type { BBox } from 'geojson';
import type { VectorSourceSpecification } from 'maplibre-gl';

import type { IDataset, WithChildren } from '../interfaces/dataset.base';
import {
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
} from '../menu/items';
import { createGroupDataset, createRootDataset } from '../model/dataset.base';
import { createMultiMapboxLayerComponent } from '../model/layer/model';
import {
  createDatasetPartGroupSubListViewUiComponentBuilder,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartSubListViewUiComponentBuilder,
} from '../model/list/builder';
import { createDatasetPartBoundComponent } from '../model/part-bound.model';
import type { LayerStyleType } from '../style/layer-simple-builder';
import {
  buildAutoVectorTileStyleLayers,
  buildSimpleStyleLayers,
} from '../style/layer-simple-builder';
import { createDatasetPartVectorTileComponent } from './source';

export type VectorTileStyleMode = 'auto' | LayerStyleType;

export type VectorTileDatasetOption = {
  name: string;
  /** MapLibre vector `tiles` template(s). Prefer over `url`. */
  tiles?: string[];
  /** Single tile URL template; normalized into `tiles` when `tiles` is empty. */
  url?: string;
  bounds?: VectorSourceSpecification['bounds'];
  maxzoom?: number;
  minzoom?: number;
  /** MapLibre `source-layer` for a single paint group (legacy). */
  sourceLayer?: string;
  /**
   * Selected source-layers.
   * One layer → a single list row; two or more → one parent GroupSubList
   * (master checkbox) with each layer as a SubList.
   */
  sourceLayers?: string[];
  /**
   * Paint mode. Default `auto` = area(+outline) + line + point per source-layer.
   * Explicit `point` | `line` | `area` keeps a single style expansion.
   */
  styleType?: VectorTileStyleMode;
  color?: Color;
  opacity?: number;
};

function toBBox(bounds: VectorSourceSpecification['bounds']): BBox | undefined {
  if (!bounds || bounds.length < 4) return undefined;
  return [bounds[0], bounds[1], bounds[2], bounds[3]];
}

function resolveTiles(data: VectorTileDatasetOption): string[] {
  if (data.tiles?.length) return data.tiles;
  if (data.url?.trim()) return [data.url.trim()];
  return [];
}

function resolveSourceLayers(
  data: VectorTileDatasetOption,
): Array<string | undefined> {
  if (data.sourceLayers?.length) return data.sourceLayers;
  if (data.sourceLayer?.trim()) return [data.sourceLayer.trim()];
  return [undefined];
}

function paintLayersForSource(
  styleType: VectorTileStyleMode,
  color: Color,
  opacity: number | undefined,
  sourceLayer: string | undefined,
) {
  if (styleType === 'auto') {
    return buildAutoVectorTileStyleLayers(color, opacity, sourceLayer);
  }
  return buildSimpleStyleLayers(styleType, color, opacity, {
    sourceLayer,
    withTypeFilter: false,
  });
}

/**
 * Build a root dataset with one shared vector source.
 *
 * - **1 source-layer** (or none): one flat list row + paint layers (like raster/geojson).
 * - **2+ source-layers**: one parent GroupSubList (master show checkbox) and each
 *   source-layer as a SubList under it.
 */
export function createVectorTileDataset(
  data: VectorTileDatasetOption,
): IDataset {
  const tiles = resolveTiles(data);
  const dataset = createRootDataset(data.name);
  const styleType = data.styleType ?? 'auto';
  const sourceLayers = resolveSourceLayers(data);

  const source = createDatasetPartVectorTileComponent(data.name, {
    tiles,
    maxzoom: data.maxzoom,
    minzoom: data.minzoom,
    bounds: data.bounds,
  });
  dataset.add(source);

  const bbox = toBBox(data.bounds);
  if (bbox) {
    dataset.add(createDatasetPartBoundComponent(data.name, bbox));
  }

  if (sourceLayers.length > 1) {
    attachGroupedSourceLayers(dataset, data, sourceLayers, styleType, bbox);
  } else {
    attachFlatSourceLayer(dataset, data, sourceLayers[0], styleType, bbox);
  }

  return dataset;
}

function attachFlatSourceLayer(
  dataset: IDataset & WithChildren,
  data: VectorTileDatasetOption,
  sourceLayer: string | undefined,
  styleType: VectorTileStyleMode,
  bbox: BBox | undefined,
) {
  const color = data.color || getChartColorAt(0) || getChartRandomColor();
  const listMenus = [createMenuItemToggleShow()];
  if (bbox) {
    listMenus.push(createMenuItemToBoundActionForList());
  }

  const list = createDatasetPartListViewUiComponentBuilder(data.name)
    .setColor(color)
    .addMenus(listMenus)
    .build();

  const groupLayer = createGroupDataset(data.name);
  groupLayer.add(list);
  groupLayer.add(
    createMultiMapboxLayerComponent(
      data.name,
      paintLayersForSource(
        styleType,
        list.color ?? color,
        data.opacity,
        sourceLayer,
      ),
    ),
  );
  dataset.add(groupLayer);
}

function attachGroupedSourceLayers(
  dataset: IDataset & WithChildren,
  data: VectorTileDatasetOption,
  sourceLayers: Array<string | undefined>,
  styleType: VectorTileStyleMode,
  bbox: BBox | undefined,
) {
  const parentColor = data.color || getChartColorAt(0) || getChartRandomColor();
  const parentMenus = [createMenuItemToggleShow({ location: 'bottom' })];
  if (bbox) {
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

  sourceLayers.forEach((sourceLayer, index) => {
    const subName = sourceLayer?.trim() || `${data.name} ${index + 1}`;
    const color = getChartColorAt(index) || getChartRandomColor();
    const subList = createDatasetPartSubListViewUiComponentBuilder(subName)
      .setColor(color)
      .addMenus([createMenuItemToggleShow()])
      .build();

    const groupSub = createGroupDataset(subName);
    groupSub.add(subList);
    groupSub.add(
      createMultiMapboxLayerComponent(
        subName,
        paintLayersForSource(
          styleType,
          subList.color ?? color,
          data.opacity,
          sourceLayer,
        ),
      ),
    );
    parentList.add(groupSub);
  });
}
