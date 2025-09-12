import type { MapSimple } from '@hungpvq/shared-map';
import type {
  GeoJSONSource,
  GeoJSONSourceSpecification,
  RasterSourceSpecification,
  VectorSourceSpecification,
} from 'maplibre-gl';
import { createWithDataHelper } from '../../extra';
import type { IMapboxSourceView, IMetadataView } from '../../interfaces';
import { createNamedComponent } from '../base';
import { findSiblingOrNearestLeaf } from '../visitors';
import { createDatasetPartMapboxSourceComponent } from './base';

export function createDatasetPartGeojsonSourceComponent(
  name: string,
  data?: GeoJSONSourceSpecification['data'],
): IMapboxSourceView {
  const base = createDatasetPartMapboxSourceComponent(name);
  const dataHelper = createWithDataHelper<
    GeoJSONSourceSpecification['data'] | undefined
  >(data);

  return createNamedComponent('GeojsonSourceComponent', {
    ...base,
    ...dataHelper,
    getMapboxSource: () => ({
      type: 'geojson',
      data: dataHelper.getData() || {
        type: 'FeatureCollection',
        features: [],
      },
    }),
    getFieldsInfo: () => [
      { trans: 'map.layer-control.field.name', value: 'name' },
      { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
      {
        trans: 'map.layer-control.field.geojson',
        value: 'geojson',
        inline: true,
      },
    ],
    getDataInfo: () => {
      const metadata = findSiblingOrNearestLeaf(
        base,
        (d) => d.type === 'metadata',
      ) as IMetadataView;

      return {
        name: base.getName(),
        bbox: metadata?.metadata?.bbox,
        geojson: JSON.stringify(dataHelper.getData(), undefined, 2),
      };
    },
    updateData(
      map: MapSimple,
      data:
        | GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | string,
    ) {
      const source = map.getSource(base.id) as GeoJSONSource;
      if (source) {
        source.setData(data);
      }
      dataHelper.setData(data);
    },
  });
}
export function createDatasetPartRasterSourceComponent(
  name: string,
  data: RasterSourceSpecification,
): IMapboxSourceView {
  const base = createDatasetPartMapboxSourceComponent(name);
  const dataHelper = createWithDataHelper<RasterSourceSpecification>(data);

  return createNamedComponent('RasterSourceComponent', {
    ...base,
    ...dataHelper,
    getMapboxSource: () => dataHelper.getData(),
    getFieldsInfo: () => [
      { trans: 'map.layer-control.field.name', value: 'name' },
      { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
      { trans: 'map.layer-control.field.tiles', value: 'tiles' },
    ],
    getDataInfo: () => {
      const metadata = findSiblingOrNearestLeaf(
        base,
        (d) => d.type === 'metadata',
      ) as IMetadataView;

      const raster = dataHelper.getData();
      return {
        name: base.getName(),
        bbox: metadata?.metadata?.bbox || raster?.bounds,
        tiles: raster?.tiles?.join(',\n'),
      };
    },
  });
}

export function createDatasetPartVectorTileComponent(
  name: string,
  data?: Partial<VectorSourceSpecification>,
): IMapboxSourceView {
  const base = createDatasetPartMapboxSourceComponent(name);
  const dataHelper = createWithDataHelper<
    Partial<VectorSourceSpecification> | undefined
  >(data);

  return createNamedComponent('GeojsonSourceComponent', {
    ...base,
    ...dataHelper,
    getMapboxSource: () => ({
      type: 'vector',
      ...dataHelper.getData(),
    }),

    getFieldsInfo: () => [
      { trans: 'map.layer-control.field.name', value: 'name' },
      { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
      {
        trans: 'map.layer-control.field.minzoom',
        value: 'minzoom',
      },
      {
        trans: 'map.layer-control.field.maxzoom',
        value: 'maxzoom',
      },
    ],
    getDataInfo: () => {
      const metadata = findSiblingOrNearestLeaf(
        base,
        (d) => d.type === 'metadata',
      ) as IMetadataView;

      const raster = dataHelper.getData();
      return {
        name: base.getName(),
        bbox: metadata?.metadata?.bbox || raster?.bounds,
        tiles: raster?.tiles?.join(',\n'),
        minzoom: raster?.minzoom,
        maxzoom: raster?.maxzoom,
      };
    },
  });
}
