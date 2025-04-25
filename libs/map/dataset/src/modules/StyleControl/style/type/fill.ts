import type { FillLayer } from 'mapbox-gl';
import type { LayerTypeConfig } from './style';

export const FILL_CONFIG: LayerTypeConfig<FillLayer> = {
  TAB: {
    type: 'single',
    items: [
      {
        trans: 'fill-style.setting.color',
        key: 'fill-color',
        type: 'color',
        disabled: (layer) => {
          return !!layer.paint?.['fill-pattern'];
        },
      },
      {
        trans: 'fill-style.setting.fill-pattern',
        key: 'fill-pattern',
        type: 'image',
        format: (value: string) => {
          if (!value) {
            return undefined;
          }
          return value;
        },
      },
      {
        trans: 'fill-style.setting.opacity',
        key: 'fill-opacity',
        type: 'opacity',
      },
      {
        trans: 'fill-style.setting.fill-antialias',
        key: 'fill-antialias',
        type: 'boolean',
      },
      {
        trans: 'fill-style.setting.fill-outline-color',
        key: 'fill-outline-color',
        type: 'color',
        disabled: (layer) =>
          !!layer.paint?.['fill-pattern'] ||
          layer.paint?.['fill-antialias'] === false,
      },
      {
        trans: 'fill-style.setting.translate',
        key: 'fill-translate',
        type: 'array',
      },
    ],
  },
  DEFAULT: {
    type: 'fill',
    paint: {
      'fill-antialias': true,
      'fill-color': '#000000',
      'fill-opacity': 1,
      'fill-translate': [0, 0],
    },
  },
};
