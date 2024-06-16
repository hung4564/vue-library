import { IBuild, ILayer, LayerAction } from '@hungpv97/vue-map-core';
import { Layer } from '../../model';
import {
  LayerListBuild,
  LayerMapBuild,
  LayerRasterMapboxBuild,
} from '../build';
import { toBoundAction, toggleShowAction } from '../build/action';
import { LayerInfoShowBuild } from '../build/info';
import { RasterSource, RasterSourceBuild } from '../build/map/source';
import { setupDefault } from './_default';
import { OptionRasterJson, OptionRasterTile } from './type';

export function createRasterUrlLayer(options: OptionRasterTile) {
  const layer = new Layer();
  const { name, tiles, bounds } = options;
  layer.setInfo({ name, metadata: {} });
  const builds: IBuild[] = [
    new RasterSourceBuild().setTiles(tiles).setBounds(bounds),
    new LayerListBuild(),
    new LayerMapBuild().setLayer(new LayerRasterMapboxBuild().build()),
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
          trans: 'map.layer-control.field.tiles',
          value: (layer: ILayer) => {
            return (layer.getView('source') as RasterSource).option.tiles?.join(
              ',\n'
            );
          },
        },
      ],
    }),
  ];
  const actions: LayerAction[] = [toBoundAction(), toggleShowAction()];
  return setupDefault(layer, { builds, actions }, options);
}

export function createRasterJsonLayer(options: OptionRasterJson) {
  const { name, url } = options;
  const layer = new Layer();
  layer.setInfo({ name, metadata: {} });
  const builds: IBuild[] = [
    new RasterSourceBuild().setUrl(url),
    new LayerListBuild(),
    new LayerMapBuild().setLayer(new LayerRasterMapboxBuild().build()),
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
          trans: 'map.layer-control.field.url',
          value: (layer: ILayer) => {
            return (layer.getView('source') as RasterSource).option.url;
          },
          inline: true,
        },
      ],
    }),
  ];
  const actions: LayerAction[] = [toBoundAction(), toggleShowAction()];

  return setupDefault(layer, { builds, actions }, options);
}
