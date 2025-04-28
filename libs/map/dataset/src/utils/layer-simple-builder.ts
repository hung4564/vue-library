import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  LayerSpecification as LayerMapbox,
  LineLayerSpecification,
  RasterLayerSpecification,
  SymbolLayerSpecification,
} from 'maplibre-gl';

import type { Color } from '@hungpvq/shared-map';
import { getChartRandomColor } from '@hungpvq/vue-map-core';
export interface ILayerMapboxBuild {
  build(): Omit<LayerMapbox, 'id' | 'source'>;
}
export class LayerRasterMapboxBuild implements ILayerMapboxBuild {
  build(): Omit<RasterLayerSpecification, 'id' | 'source'> {
    return {
      type: 'raster',
    };
  }
}
export class LayerSimpleMapboxBuild implements ILayerMapboxBuild {
  public color?: Color;
  public opacity?: number;
  public type = 'point';
  setColor(color: Color | undefined) {
    this.color = color;
    return this;
  }
  setStyleType(type: string) {
    this.type = type;
    return this;
  }
  setOpacity(opacity: number) {
    this.opacity = opacity;
    return this;
  }
  build(): Omit<LayerMapbox, 'id'> {
    return getDefaultLayer(this.type, this.color, this.opacity);
  }
}

export const getDefaultLayer = (
  type: string,
  color?: Color,
  opacity?: number
): Omit<
  | LineLayerSpecification
  | FillLayerSpecification
  | CircleLayerSpecification
  | SymbolLayerSpecification,
  'id' | 'source'
> => {
  switch (type) {
    case 'point':
      return {
        layout: { visibility: 'visible' },
        type: 'circle',
        paint: {
          'circle-color': color || getChartRandomColor(),
          'circle-radius': 6,
          'circle-opacity': opacity || 1,
        },
      };

    case 'line':
      return {
        layout: { visibility: 'visible' },
        type: 'line',
        paint: {
          'line-color': color || getChartRandomColor(),
          'line-width': 4,
          'line-opacity': opacity || 1,
        },
      };
    case 'area':
      return {
        layout: { visibility: 'visible' },
        type: 'fill',
        paint: {
          'fill-color': color || getChartRandomColor(),
          'fill-opacity': opacity || 1,
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
