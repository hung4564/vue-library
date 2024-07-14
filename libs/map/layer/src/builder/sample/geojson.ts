import {
  IBuild,
  ILayer,
  LayerAction,
  getChartRandomColor,
} from '@hungpvq/vue-map-core';
import { Layer } from '../../model';
import {
  LayerBuilder,
  LayerSimpleMapboxBuild,
  toBoundAction,
  toggleShowAction,
} from '../build';
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
    LayerBuilder.source(new GeoJsonSourceBuild()).setData(geojson),
    LayerBuilder.list().setColor(color),
    LayerBuilder.identify(),
    LayerBuilder.info().setFields([
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
    ]),
  ];
  const mapBuild = LayerBuilder.map();
  if (type) {
    mapBuild.setLayer(
      new LayerSimpleMapboxBuild().setStyleType(type).setColor(color).build()
    );
  }
  builds.push(mapBuild);
  const actions: LayerAction[] = [toBoundAction(), toggleShowAction()];
  return setupDefault(layer, { builds, actions }, options);
}
