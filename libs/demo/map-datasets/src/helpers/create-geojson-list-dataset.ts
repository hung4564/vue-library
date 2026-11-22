import { getChartRandomColor } from '@hungpvq/map-core';
import {
  createDatasetPartBoundComponent,
  createDatasetPartListViewUiComponentBuilder,
  createGroupDataset,
  createMultiMapboxLayerComponent,
  createRootDataset,
  type DatasetComposite,
  type IListViewUI,
} from '@hungpvq/map-dataset';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import type { MenuAction } from '@hungpvq/map-dataset/menu';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';
import type { Feature } from 'geojson';
import type { FilterSpecification } from 'maplibre-gl';

export type GeoJsonListLayerStyle = {
  styleType: 'point' | 'line' | 'area';
  layerId?: string;
  filter?: FilterSpecification;
  opacity?: number;
};

export type GeoJsonListDatasetParts = {
  dataset: DatasetComposite;
  source: ReturnType<typeof createDatasetPartGeojsonSourceComponent>;
  bound?: ReturnType<typeof createDatasetPartBoundComponent>;
  group: ReturnType<typeof createGroupDataset>;
  list: IListViewUI;
  layers: ReturnType<typeof createMultiMapboxLayerComponent>[];
};

export type CreateGeoJsonListDatasetOptions = {
  name: string;
  features: Feature[];
  bbox?: [number, number, number, number];
  groupName?: string;
  color?: string;
  configDisabledDelete?: boolean;
  layers: GeoJsonListLayerStyle[];
  menus?:
    | MenuAction[]
    | ((parts: Pick<GeoJsonListDatasetParts, 'bound'>) => MenuAction[]);
  /** Add extra parts (identify, menus part, highlight) or post-build list menus. */
  configure?: (parts: GeoJsonListDatasetParts) => void;
};

/**
 * Common demo pattern: root → geojson source → optional bound → group → list + styled layers.
 */
export function createGeoJsonListDataset(
  options: CreateGeoJsonListDatasetOptions,
): DatasetComposite {
  const {
    name,
    features,
    bbox,
    groupName = name,
    layers: layerConfigs,
    configDisabledDelete,
  } = options;

  const dataset = createRootDataset(name);
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features,
  });

  let bound: ReturnType<typeof createDatasetPartBoundComponent> | undefined;
  if (bbox) {
    bound = createDatasetPartBoundComponent(name, bbox);
  }

  const listBuilder = createDatasetPartListViewUiComponentBuilder(
    name,
  ).setColor(options.color ?? getChartRandomColor());
  if (configDisabledDelete) {
    listBuilder.configDisabledDelete();
  }

  const menus =
    typeof options.menus === 'function'
      ? options.menus({ bound })
      : options.menus;
  if (menus?.length) {
    listBuilder.addMenus(menus);
  }

  const list = listBuilder.build();

  const layers = layerConfigs.map((cfg) => {
    const style = new LayerSimpleMapboxBuild()
      .setStyleType(cfg.styleType)
      .setColor(list.color);
    if (cfg.opacity !== undefined) {
      style.setOpacity(cfg.opacity);
    }
    if (cfg.filter !== undefined) {
      style.setFilter(cfg.filter);
    }
    return createMultiMapboxLayerComponent(
      cfg.layerId ?? `layer ${cfg.styleType}`,
      [style.build()],
    );
  });

  const group = createGroupDataset(groupName);
  for (const layer of layers) {
    group.add(layer);
  }
  group.add(list);

  dataset.add(source);
  if (bound) {
    dataset.add(bound);
  }
  dataset.add(group);

  options.configure?.({ dataset, source, bound, group, list, layers });

  return dataset;
}
