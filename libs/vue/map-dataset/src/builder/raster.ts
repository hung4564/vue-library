import type { RasterSourceSpecification } from 'maplibre-gl';
import type { IDataset } from '../interfaces';
import {
  createDatasetPartListViewUiComponent,
  createDatasetPartRasterSourceComponent,
  createGroupDataset,
  createMultiMapboxLayerComponent,
  createRootDataset,
} from '../model';

export type RasterUrlDatasetOption = {
  name: string;
  tiles: string[];
  bounds?: RasterSourceSpecification['bounds'];
  maxzoom?: number;
  minzoom?: number;
};
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
  const groupLayer_raster = createGroupDataset(data.name);
  dataset_raster.add(source_raster);
  groupLayer_raster.add(list_raster);
  groupLayer_raster.add(layerraster);
  dataset_raster.add(groupLayer_raster);
  return dataset_raster;
}
