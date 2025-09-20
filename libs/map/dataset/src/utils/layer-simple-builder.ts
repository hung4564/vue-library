import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  FilterSpecification,
  LayerFeatureStates,
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
export type LayerStyleType = 'point' | 'line' | 'area' | 'symbol';

export class LayerSimpleMapboxBuild implements ILayerMapboxBuild {
  public color?: Color;
  public opacity?: number;
  public type: LayerStyleType = 'point';
  public filter?: any = undefined;
  setColor(color: Color | undefined) {
    this.color = color;
    return this;
  }
  setFilter(filter?: FilterSpecification) {
    this.filter = filter;
    return this;
  }
  setStyleType(type: LayerStyleType) {
    this.type = type;
    return this;
  }
  setOpacity(opacity: number) {
    this.opacity = opacity;
    return this;
  }
  build(): Omit<LayerMapbox, 'id'> {
    return getDefaultLayer({
      type: this.type,
      color: this.color,
      opacity: this.opacity,
      filter: this.filter,
    });
  }
}

export const getDefaultLayer = ({
  type,
  color,
  opacity,
  filter,
}: {
  type: string;
  color?: Color;
  opacity?: number;
  filter?: FilterSpecification;
}): Omit<
  | LineLayerSpecification
  | FillLayerSpecification
  | CircleLayerSpecification
  | SymbolLayerSpecification,
  'id' | 'source'
> => {
  let layer:
    | LineLayerSpecification
    | FillLayerSpecification
    | CircleLayerSpecification
    | SymbolLayerSpecification;
  switch (type) {
    case 'point':
      layer = {
        layout: { visibility: 'visible' },
        type: 'circle',
        paint: {
          'circle-color': color || getChartRandomColor(),
          'circle-radius': 6,
          'circle-opacity': opacity || 1,
        },
      } as CircleLayerSpecification;
      break;

    case 'line':
      layer = {
        layout: { visibility: 'visible' },
        type: 'line',
        paint: {
          'line-color': color || getChartRandomColor(),
          'line-width': 4,
          'line-opacity': opacity || 1,
        },
      } as LineLayerSpecification;
      break;
    case 'area':
      layer = {
        layout: { visibility: 'visible' },
        type: 'fill',
        paint: {
          'fill-color': color || getChartRandomColor(),
          'fill-opacity': opacity || 1,
        },
      } as FillLayerSpecification;
      break;

    case 'symbol':
      layer = {
        layout: { visibility: 'visible' },
        type: 'symbol',
        paint: {},
      } as SymbolLayerSpecification;
      break;

    default:
      throw new Error('Invalid type: ' + type);
  }
  if (filter) {
    layer.filter = filter;
  }
  return layer;
};
