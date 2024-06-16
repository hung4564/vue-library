import { ABuild, AView, ILayer } from '@hungpvq/vue-map-core';
import { callDrawForLayer } from '../store';
import { IDrawHandler, IDrawOption, ILayerDrawView } from '../types';
import { GeojsonDataHandle } from './handler';

const KEY = 'draw';
const handler = new GeojsonDataHandle();
export class LayerDrawBuild extends ABuild<IDrawOption> {
  constructor(option = { draw_support: [], handler }) {
    super(KEY, option);
    this.setBuild((_: any, option: IDrawOption) => new LayerDrawView(option));
  }
  setDrawSupport(draw_support: string[]) {
    this.option.draw_support = draw_support;
    return this;
  }
  setHandler(handler: IDrawHandler) {
    this.option.handler = handler;
  }
  setForLayer(layer: ILayer) {
    layer.getView('action').addAction({
      id: KEY,
      menu: {
        id: KEY,
        location: 'menu',
        name: 'draw',
        type: 'item',
        click(layer, map_id) {
          callDrawForLayer(map_id, layer);
        },
      },
    });
    return this;
  }
}
export class LayerDrawView extends AView implements ILayerDrawView {
  option: IDrawOption;
  constructor(option: IDrawOption) {
    super();
    this.option = option;
  }
  get draw_support() {
    return this.option.draw_support;
  }
  get handler() {
    return this.option.handler;
  }
}
