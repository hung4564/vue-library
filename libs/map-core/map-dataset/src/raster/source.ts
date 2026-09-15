import type {
  RasterSourceSpecification,
} from 'maplibre-gl';
import type { IMapboxSourceView } from '../interfaces/dataset.parts';
import { resolveDatasetBbox } from '../utils/bbox';
import {
  buildTileSourceDataInfo,
  getTileSourceFieldsInfo,
} from '../utils/map-source-info';
import { createNamedComponent } from '../model/base';
import { createDatasetPartMapboxSourceComponent } from '../model/source/base';

export function createDatasetPartRasterSourceComponent(
  name: string,
  data: RasterSourceSpecification,
): IMapboxSourceView {
  const base =
    createDatasetPartMapboxSourceComponent<RasterSourceSpecification>(
      name,
      data,
    );

  return createNamedComponent('RasterSourceComponent', {
    ...base,
    getMapboxSource: (): RasterSourceSpecification =>
      base.getData() as RasterSourceSpecification,
    getFieldsInfo() {
      return getTileSourceFieldsInfo({ includeTileSize: true });
    },
    getDataInfo() {
      const raster = this.getMapboxSource() as RasterSourceSpecification & {
        id?: string;
      };
      return buildTileSourceDataInfo(
        base.getName(),
        this.getSourceId(),
        resolveDatasetBbox(base) || raster.bounds,
        raster,
        { includeTileSize: true },
      );
    },
  });
}
