import type { RasterSourceSpecification } from 'maplibre-gl';
import type { IDataset } from '../interfaces';
import {
  createDataset,
  createDatasetPartListViewUiComponent,
  createDatasetPartRasterSourceComponent,
  createMultiMapboxLayerComponent,
  type DatasetComposite,
} from '../model';

export type RasterUrlDatasetOption = {
  name: string;
  tiles: string[];
  bounds?: RasterSourceSpecification['bounds'];
  maxZoom?: number;
  minZoom?: number;
};
export function createRasterUrlDataset(data: RasterUrlDatasetOption): IDataset {
  const dataset_raster = createDataset(
    data.name,
    null,
    true
  ) as DatasetComposite;

  const source_raster = createDatasetPartRasterSourceComponent(data.name, {
    type: 'raster',
    tiles: data.tiles,
    maxzoom: data.maxZoom,
    minzoom: data.minZoom,
    bounds: data.bounds,
  });
  const layerraster = createMultiMapboxLayerComponent(data.name, [
    {
      type: 'raster',
    },
  ]);
  const list_raster = createDatasetPartListViewUiComponent(data.name);
  const groupLayer_raster = createDataset(
    data.name,
    null,
    true
  ) as DatasetComposite;
  dataset_raster.add(source_raster);
  groupLayer_raster.add(list_raster);
  groupLayer_raster.add(layerraster);
  dataset_raster.add(groupLayer_raster);
  return dataset_raster;
}
