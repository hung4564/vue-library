import {
  CircleLayer,
  FillLayer,
  Layer as LayerMapbox,
  LineLayer,
  RasterLayer,
  SymbolLayer,
} from 'mapbox-gl';

import type { Color } from '@hungpvq/shared-map';
import { ABuild, ILayer, getChartRandomColor } from '@hungpvq/vue-map-core';
import { mdiFormatLineStyle } from '@mdi/js';
import StyleControl from '../../../modules/StyleControl/style-control.vue';
import { MapMultiLayer } from './layer/multi-layer.map';
export class LayerMapBuild extends ABuild {
  constructor(option = {}) {
    super('map', option);
    this.setBuild((_: any, option: any) => new MapMultiLayer(option));
  }
  setLayers(layers: Omit<LayerMapbox, 'id'>[]) {
    this.option.layers = layers;
    return this;
  }
  setLayer(layer: Omit<LayerMapbox, 'id'>) {
    this.option.layers = [Object.assign({ layout: {}, paint: {} }, layer)];
    return this;
  }
  setSource(source: any) {
    this.option.source = source;
    return this;
  }
  setForLayer(layer: ILayer) {
    layer.getView('action').addAction({
      id: 'editable',
      component: () => StyleControl,
      menu: {
        id: 'editable',
        location: 'menu',
        name: 'edit style',
        type: 'item',
        icon: mdiFormatLineStyle,
        order: 2,
      },
    });
    return this;
  }
}
export interface ILayerMapboxBuild {
  build(): Omit<LayerMapbox, 'id'>;
}
export class LayerRasterMapboxBuild implements ILayerMapboxBuild {
  build(): Omit<RasterLayer, 'id'> {
    return {
      type: 'raster',
    };
  }
}
export class LayerSimpleMapboxBuild implements ILayerMapboxBuild {
  public color?: Color;
  public type = 'point';
  setColor(color: Color | undefined) {
    this.color = color;
    return this;
  }
  setStyleType(type: string) {
    this.type = type;
    return this;
  }
  build(): Omit<LayerMapbox, 'id'> {
    return getDefaultLayer(this.type, this.color);
  }
}

export const getDefaultLayer = (
  type: string,
  color?: Color
): Omit<LineLayer | FillLayer | CircleLayer | SymbolLayer, 'id'> => {
  switch (type) {
    case 'point':
      return {
        layout: { visibility: 'visible' },
        type: 'circle',
        paint: {
          'circle-color': color || getChartRandomColor(),
          'circle-radius': 6,
        },
      };

    case 'line':
      return {
        layout: { visibility: 'visible' },
        type: 'line',
        paint: {
          'line-color': color || getChartRandomColor(),
          'line-width': 4,
        },
      };
    case 'area':
      return {
        layout: { visibility: 'visible' },
        type: 'fill',
        paint: {
          'fill-color': color || getChartRandomColor(),
        },
      };

    case 'symbol':
      return {
        layout: { visibility: 'visible' },
        type: 'symbol',
        paint: {},
      };

    default:
      throw new Error('Invalid type: ' + type);
  }
};
export * from './source';
