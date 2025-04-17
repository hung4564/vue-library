import type { BBox } from 'geojson';
import { IDataset } from '../interfaces';
import {
  createDataset,
  createDatasetPartListViewUiComponent,
  MultiMapboxLayerComponent,
  RasterUrlSource,
  type DatasetComposite,
} from '../model';

export type RasterUrlDatasetOption = {
  name: string;
  tiles: string[];
  bounds?: BBox;
  maxZoom?: number;
  minZoom?: number;
};
export function createRasterUrlDataset(data: RasterUrlDatasetOption): IDataset {
  const dataset_raster = createDataset(
    data.name,
    null,
    true
  ) as DatasetComposite;

  const source_raster = new RasterUrlSource(data.name, {
    name: data.name,
    type: 'raster',
    tiles: data.tiles,
    maxZoom: data.maxZoom,
    minZoom: data.minZoom,
    bounds: data.bounds,
  });
  const layerraster = new MultiMapboxLayerComponent(data.name, [
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
