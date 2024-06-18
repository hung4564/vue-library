import { IBuild, ILayer, LayerAction } from '@hungpvq/vue-map-core';
import {
  Layer,
  LayerLegendBuild,
  LayerLegendLinearGradient,
  LayerLegendSingleColor,
  LayerListBuild,
  OptionDefault,
  setupDefault,
  toBoundAction,
  toggleShowAction,
} from '@hungpvq/vue-map-layer';
import { BBox } from '@turf/turf';

export function createCustomLayer(
  options: {
    name: string;
    tiles: string[];
    bounds?: BBox;
  } & OptionDefault
) {
  const layer = new Layer();
  layer.setInfo({ name: 'Custom legend', metadata: {} });
  const builds: IBuild[] = [
    new LayerListBuild(),
    new LayerLegendBuild().setFields([
      {
        option: { text: 'legend text', value: 'test' },
      },
      {
        option: {
          text: 'legend color',
          color: '#fff',
        },
        component: LayerLegendSingleColor,
      },
      {
        option: {
          text: 'legend linear',
          items: [
            { value: 'test 1', color: '#fff' },
            { value: 'test 2', color: '#000' },
            { value: 'test 3', color: 'red' },
          ],
        },
        component: LayerLegendLinearGradient,
      },
    ]),
  ];
  const actions: LayerAction[] = [toBoundAction(), toggleShowAction()];
  return setupDefault(layer, { builds, actions }, options);
}
