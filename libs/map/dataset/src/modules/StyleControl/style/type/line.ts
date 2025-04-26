import type { LineLayer } from 'maplibre-gl';
import type { LayerTypeConfig } from './style';

export const LINE_CONFIG: LayerTypeConfig<LineLayer> = {
  TAB: {
    type: 'single',
    items: [
      {
        trans: 'line-style.setting.color',
        key: 'line-color',
        type: 'color',
        disabled: (layer) => {
          return !!layer.paint?.['line-pattern'];
        },
      },
      {
        trans: 'line-style.setting.pattern',
        key: 'line-pattern',
        type: 'image',
        format: (value: string) => {
          if (!value) {
            return undefined;
          }
          return value;
        },
      },
      {
        trans: 'line-style.setting.opacity',
        key: 'line-opacity',
        type: 'opacity',
      },
      {
        trans: 'line-style.setting.width',
        key: 'line-width',
        type: 'unit',
        unit: 'px',
      },
      {
        trans: 'line-style.setting.cap',
        key: 'line-cap',
        type: 'chose',
        menu: [
          {
            text: 'butt',
            value: 'butt',
          },
          {
            text: 'round',
            value: 'round',
          },
          {
            text: 'square',
            value: 'square',
          },
        ],
        part: 'layout',
      },
      {
        trans: 'line-style.setting.join',
        key: 'line-join',
        type: 'chose',
        menu: [
          {
            text: 'bevel',
            value: 'bevel',
          },
          {
            text: 'round',
            value: 'round',
          },
          {
            text: 'miter',
            value: 'miter',
          },
        ],
        part: 'layout',
      },

      {
        trans: 'line-style.setting.round-limit',
        key: 'line-round-limit',
        type: 'unit',
        part: 'layout',
        unit: 'px',
        disabled: (layer) => {
          return layer.layout?.['line-join'] != 'round';
        },
      },
      {
        trans: 'line-style.setting.miter-limit',
        key: 'line-miter-limit',
        type: 'unit',
        part: 'layout',
        unit: 'px',
      },
      { type: 'divider' },
      {
        trans: 'line-style.setting.dash-array',
        key: 'line-dasharray',
        type: 'multiple',
        disabled: (layer) => {
          return !!layer.paint?.['line-pattern'];
        },
      },
      {
        trans: 'line-style.setting.grap-width',
        key: 'line-gap-width',
        type: 'unit',
        unit: 'px',
      },
      {
        trans: 'line-style.setting.blur',
        key: 'line-blur',
        type: 'unit',
        unit: 'px',
      },
      {
        trans: 'line-style.setting.offset',
        key: 'line-offset',
        type: 'unit',
        unit: 'px',
      },
      {
        trans: 'line-style.setting.translate',
        key: 'line-translate',
        type: 'array',
      },
    ],
  },
  DEFAULT: {
    type: 'line',
    paint: {
      'line-color': '#000000',
      'line-opacity': 1,
      'line-width': 0,
      'line-gap-width': 0,
      'line-blur': 0,
      'line-offset': 0,
      'line-translate': [0, 0],
    },
    layout: {
      'line-cap': 'butt',
      'line-join': 'bevel',
      'line-round-limit': 0,
      'line-miter-limit': 0,
    },
  },
};
