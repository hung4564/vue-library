import {
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMultiMapboxLayerComponent,
  createRootDataset,
  type IDataset,
} from '@hungpvq/map-dataset';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { createHighlightPart } from '@hungpvq/map-dataset/highlight';
import {
  createDatasetPartIdentifyComponentBuilder,
  type IIdentifyView,
} from '@hungpvq/map-dataset/identify';
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

export type IdentifyDemoLayerOptions = {
  /** Identify part name (and default list name). */
  name: string;
  features: IdentifyDemoPolygon[];
  listMenus?: MenuAction[];
  configureIdentify?: (b: IdentifyBuilder) => IdentifyBuilder;
  /** Called after the identify part is built (e.g. assign getList). */
  onIdentifyBuilt?: (identify: IIdentifyView) => void;
  groupName?: string;
  /** List view name; defaults to `name`. */
  listName?: string;
  listColor?: string;
  /** Passed to list.setGroup(...) when set. */
  listGroup?: { id: string; name: string };
  /** Add a black line style alongside the area fill. */
  withOutline?: boolean;
  /**
   * Where source + identify live.
   * - `root` (default): identify + source on the root dataset
   * - `group`: source + identify nested under the group layer
   */
  nestInGroup?: boolean;
};

export type IdentifyDemoOptions = IdentifyDemoLayerOptions;

export function polygonFromBounds(
  id: string | number,
  name: string,
  [west, south, east, north]: [number, number, number, number],
  extra?: Record<string, unknown>,
): Feature<Polygon> {
  return {
    type: 'Feature',
    properties: { id, name, ...extra },
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

function buildIdentifyDemoLayer(options: IdentifyDemoLayerOptions) {
  const {
    name,
    features,
    listMenus = [createMenuItemToggleShow()],
    configureIdentify,
    onIdentifyBuilt,
    groupName = 'Group layer 1',
    listName = name,
    listColor,
    listGroup,
    withOutline = false,
    nestInGroup = false,
  } = options;

  const source = createDatasetPartGeojsonSourceComponent(
    'source',
    createIdentifyDemoFeatureCollection(features),
  );
  const groupLayer = createGroupDataset(groupName);
  const listBuilder = createDatasetPartListViewUiComponentBuilder(
    listName,
  ).setColor(listColor ?? getChartRandomColor());
  if (listGroup) listBuilder.setGroup(listGroup);
  const list = listBuilder.build();
  const styles = [
    new LayerSimpleMapboxBuild()
      .setStyleType('area')
      .setColor(list.color)
      .build(),
  ];
  if (withOutline) {
    styles.push(
      new LayerSimpleMapboxBuild().setStyleType('line').setColor('#000').build(),
    );
  }
  const layer = createMultiMapboxLayerComponent(
    withOutline ? 'layer point' : 'layer area',
    styles,
  );
  const highlight = createHighlightPart();

  let identifyBuilder = createDatasetPartIdentifyComponentBuilder(name);
  if (configureIdentify) {
    identifyBuilder = configureIdentify(identifyBuilder);
  }
  const identify = identifyBuilder.build();
  onIdentifyBuilt?.(identify);

  if (nestInGroup) {
    groupLayer.add(source);
    groupLayer.add(layer);
    groupLayer.add(list);
    groupLayer.add(identify);
    groupLayer.add(highlight);
  } else {
    groupLayer.add(layer);
    groupLayer.add(highlight);
    groupLayer.add(list);
  }
  list.addMenus(listMenus);

  return { source, groupLayer, identify, list };
}

/**
 * Shared skeleton: root → geojson source → group → list + layer + highlight (+ identify).
 */
export function createIdentifyDemoDataset(
  options: IdentifyDemoOptions,
): IDataset {
  const dataset = createRootDataset(options.name);
  const { source, groupLayer, identify } = buildIdentifyDemoLayer(options);

  if (options.nestInGroup) {
    dataset.add(groupLayer);
  } else {
    dataset.add(identify);
    dataset.add(source);
    dataset.add(groupLayer);
  }
  return dataset;
}

/**
 * Root with multiple nested group layers (source + identify inside each group).
 */
export function createIdentifyDemoMultiDataset(options: {
  rootName: string;
  layers: IdentifyDemoLayerOptions[];
}): IDataset {
  const dataset = createRootDataset(options.rootName);
  for (const layer of options.layers) {
    const { groupLayer } = buildIdentifyDemoLayer({
      ...layer,
      nestInGroup: true,
      groupName: layer.groupName ?? layer.name,
    });
    dataset.add(groupLayer);
  }
  return dataset;
}
