import type {
  RasterSourceSpecification,
} from 'maplibre-gl';
import type { IMapboxSourceView } from '../interfaces';
import { resolveDatasetBbox } from '../utils/bbox';
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
      return [
        { trans: 'map.layer-control.field.name', value: 'name' },
        { trans: 'map.layer-control.field.type', value: 'type' },
        { trans: 'map.layer-control.field.source-id', value: 'sourceId' },
        { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
        { trans: 'map.layer-control.field.url', value: 'url', inline: true },
        { trans: 'map.layer-control.field.tiles', value: 'tiles', inline: true },
        { trans: 'map.layer-control.field.tile-size', value: 'tileSize' },
        { trans: 'map.layer-control.field.minzoom', value: 'minzoom' },
        { trans: 'map.layer-control.field.maxzoom', value: 'maxzoom' },
        { trans: 'map.layer-control.field.scheme', value: 'scheme' },
        { trans: 'map.layer-control.field.attribution', value: 'attribution' },
      ];
    },
    getDataInfo() {
      const raster = this.getMapboxSource() as RasterSourceSpecification & {
        id?: string;
      };
      return {
        name: base.getName(),
        type: raster.type,
        sourceId: this.getSourceId(),
        bbox: resolveDatasetBbox(base) || raster.bounds,
        url: raster.url,
        tiles: raster.tiles?.join('\n'),
        tileSize: raster.tileSize,
        minzoom: raster.minzoom,
        maxzoom: raster.maxzoom,
        scheme: raster.scheme,
        attribution: raster.attribution,
      };
    },
  });
}
