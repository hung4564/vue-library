import type { BBox } from 'geojson';
import type { RasterSourceSpecification } from 'maplibre-gl';
import type { IDataset } from '../interfaces';
import {
  createMenuItemToBoundActionForList,
  createMenuItemToggleShow,
} from '../extra/menu/items';
import { createDatasetPartListViewUiComponent } from '../model/list';
import { createDatasetPartMetadataComponent } from '../model/part-metadata.model';
import { createDatasetPartRasterSourceComponent } from '../model/source';
import { createGroupDataset, createRootDataset } from '../model/dataset.base';
import { createMultiMapboxLayerComponent } from '../model/layer';

export type RasterUrlDatasetOption = {
  name: string;
  tiles: string[];
  bounds?: RasterSourceSpecification['bounds'];
  maxzoom?: number;
  minzoom?: number;
};

function toBBox(bounds: RasterSourceSpecification['bounds']): BBox | undefined {
  if (!bounds || bounds.length < 4) return undefined;
  return [bounds[0], bounds[1], bounds[2], bounds[3]];
}

export function createRasterUrlDataset(data: RasterUrlDatasetOption): IDataset {
  const dataset_raster = createRootDataset(data.name);

  const source_raster = createDatasetPartRasterSourceComponent(data.name, {
    type: 'raster',
    tiles: data.tiles,
    maxzoom: data.maxzoom,
    minzoom: data.minzoom,
    bounds: data.bounds,
  });
  const layerraster = createMultiMapboxLayerComponent(data.name, [
    {
      type: 'raster',
    },
  ]);
  const list_raster = createDatasetPartListViewUiComponent(data.name);
  const bbox = toBBox(data.bounds);
  const listMenus = [createMenuItemToggleShow()];
  if (bbox) {
    dataset_raster.add(createDatasetPartMetadataComponent(data.name, { bbox }));
    listMenus.push(createMenuItemToBoundActionForList({ bbox }));
  }
  list_raster.addMenus(listMenus);

  const groupLayer_raster = createGroupDataset(data.name);
  dataset_raster.add(source_raster);
  groupLayer_raster.add(list_raster);
  groupLayer_raster.add(layerraster);
  dataset_raster.add(groupLayer_raster);
  return dataset_raster;
}
