import {
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMultiMapboxLayerComponent,
  createRootDataset,
  type IDataset,
} from '@hungpvq/map-dataset';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { createHighlightPart } from '@hungpvq/map-dataset/highlight';
import { createDatasetPartIdentifyComponentBuilder } from '@hungpvq/map-dataset/identify';
import {
  createMenuItemToggleShow,
  type MenuAction,
} from '@hungpvq/map-dataset/menu';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';
import { getChartRandomColor } from '@hungpvq/map-core';
import type { Feature, FeatureCollection, Polygon } from 'geojson';

type IdentifyBuilder = ReturnType<
  typeof createDatasetPartIdentifyComponentBuilder
>;

export type IdentifyDemoPolygon = {
  id: string | number;
  name: string;
  /** SW–NE style ring: [west, south, east, north] in lng/lat */
  bounds: [number, number, number, number];
};

export type IdentifyDemoOptions = {
  name: string;
  features: IdentifyDemoPolygon[];
  listMenus?: MenuAction[];
  configureIdentify?: (b: IdentifyBuilder) => IdentifyBuilder;
  groupName?: string;
  listColor?: string;
};

function polygonFromBounds(
  id: string | number,
  name: string,
  [west, south, east, north]: [number, number, number, number],
): Feature<Polygon> {
  return {
    type: 'Feature',
    properties: { id, name },
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [west, north],
          [west, south],
          [east, south],
          [east, north],
          [west, north],
        ],
      ],
    },
  };
}

export function createIdentifyDemoFeatureCollection(
  features: IdentifyDemoPolygon[],
): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features.map((f) =>
      polygonFromBounds(f.id, f.name, f.bounds),
    ),
  };
}

/**
 * Shared skeleton: root → geojson source → group → list + layer + highlight (+ identify).
 */
export function createIdentifyDemoDataset(
  options: IdentifyDemoOptions,
): IDataset {
  const {
    name,
    features,
    listMenus = [createMenuItemToggleShow()],
    configureIdentify,
    groupName = 'Group layer 1',
    listColor,
  } = options;

  const dataset = createRootDataset(name);
  const source = createDatasetPartGeojsonSourceComponent(
    'source',
    createIdentifyDemoFeatureCollection(features),
  );
  const groupLayer = createGroupDataset(groupName);
  const list = createDatasetPartListViewUiComponentBuilder(name)
    .setColor(listColor ?? getChartRandomColor())
    .build();
  const layer = createMultiMapboxLayerComponent('layer area', [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .build(),
  ]);
  const highlight = createHighlightPart();
  groupLayer.add(layer);
  groupLayer.add(highlight);
  groupLayer.add(list);
  list.addMenus(listMenus);

  let identifyBuilder = createDatasetPartIdentifyComponentBuilder(name);
  if (configureIdentify) {
    identifyBuilder = configureIdentify(identifyBuilder);
  }
  const identify = identifyBuilder.build();

  dataset.add(identify);
  dataset.add(source);
  dataset.add(groupLayer);
  return dataset;
}
