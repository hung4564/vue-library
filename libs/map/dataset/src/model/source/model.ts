import type { MapSimple } from '@hungpvq/shared-map';
import { GeoJSONSource, GeoJSONSourceRaw, RasterSource } from 'mapbox-gl';
import { IDataset, IMapboxSourceView, IMetadataView } from '../../interfaces';
import { createNamedComponent } from '../base';
import { findSiblingOrNearestLeaf } from '../dataset.visitors';
import { createDatasetPartMapboxSourceComponent } from './base';

export function createDatasetPartGeojsonSourceComponent(
  name: string,
  data?: GeoJSONSourceRaw['data']
): IMapboxSourceView & IDataset {
  const base = createDatasetPartMapboxSourceComponent(name, data);

  return createNamedComponent('GeojsonSourceComponent', {
    ...base,
    getMapboxSource: () => ({
      type: 'geojson',
      data: base.getData() || {
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
        (d) => d.type === 'metadata'
      ) as IMetadataView;

      return {
        name: base.getName(),
        bbox: metadata?.metadata?.bbox,
        geojson: JSON.stringify(base.getData(), undefined, 2),
      };
    },
    updateData(
      map: MapSimple,
      data:
        | GeoJSON.Feature<GeoJSON.Geometry>
        | GeoJSON.FeatureCollection<GeoJSON.Geometry>
        | string
    ) {
      const source = map.getSource(base.id) as GeoJSONSource;
      if (source) {
        source.setData(data);
      }
      base.setData(data);
    },
  });
}
export function createDatasetPartRasterSourceComponent(
  name: string,
  data?: RasterSource
): IMapboxSourceView & IDataset {
  const base = createDatasetPartMapboxSourceComponent(name, data);

  return createNamedComponent('RasterSourceComponent', {
    ...base,
    getMapboxSource: () => base.getData(),
    getFieldsInfo: () => [
      { trans: 'map.layer-control.field.name', value: 'name' },
      { trans: 'map.layer-control.field.bound.title', value: 'bbox' },
      { trans: 'map.layer-control.field.tiles', value: 'tiles' },
    ],
    getDataInfo: () => {
      const metadata = findSiblingOrNearestLeaf(
        base,
        (d) => d.type === 'metadata'
      ) as IMetadataView;

      const raster = base.getData();
      return {
        name: base.getName(),
        bbox: metadata?.metadata?.bbox || raster?.bounds,
        tiles: raster?.tiles?.join(',\n'),
      };
    },
  });
}
