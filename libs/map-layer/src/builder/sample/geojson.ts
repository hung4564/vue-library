import {
  IBuild,
  ILayer,
  LayerAction,
  getChartRandomColor,
} from '@hungpv97/vue-map-core';
import { Layer } from '../../model';
import {
  LayerListBuild,
  LayerMapBuild,
  LayerSimpleMapboxBuild,
  toBoundAction,
  toggleShowAction,
} from '../build';
import { LayerIdentifyBuild } from '../build/identify';
import { LayerInfoShowBuild } from '../build/info';
import { GeoJsonSourceBuild, GeojsonSource } from '../build/map';
import { setupDefault } from './_default';
import { OptionGeojson } from './type';

export function createGeoJsonLayer(options: OptionGeojson) {
  const { name, geojson, type } = options;
  let { color } = options;
  const layer = new Layer();
  layer.setInfo({ name, metadata: {} });
  color = color || getChartRandomColor();
  const builds: IBuild[] = [
    new GeoJsonSourceBuild().setData(geojson),
    new LayerListBuild().setColor(color!),
    new LayerIdentifyBuild(),
    new LayerInfoShowBuild({
      fields: [
        {
          trans: 'map.layer-control.field.name',
          value: 'name',
        },
        {
          trans: 'map.layer-control.field.bound.title',
          value: (layer: ILayer) => {
            const bounds = layer.metadata.bounds;
            return (
              bounds && `${bounds[0]}, ${bounds[1]}, ${bounds[2]},${bounds[3]}`
            );
          },
        },
        {
          trans: 'map.layer-control.field.geojson',
          value: (layer: ILayer) => {
            const geojson = (layer.getView('source') as GeojsonSource).geojson;
            return JSON.stringify(geojson, undefined, 2);
          },
          inline: true,
        },
      ],
    }),
  ];
  if (type) {
    builds.push(
      new LayerMapBuild().setLayer(
        new LayerSimpleMapboxBuild().setStyleType(type).setColor(color).build()
      )
    );
  }
  const actions: LayerAction[] = [toBoundAction(), toggleShowAction()];
  return setupDefault(layer, { builds, actions }, options);
}
