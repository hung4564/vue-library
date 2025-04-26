import type { LayerTypeConfig, Tab } from './style';

import type { SymbolLayer } from 'maplibre-gl';

const TEXT_STYLE: Tab<SymbolLayer>[] = [
  {
    trans: 'symbol-style.setting.text-field',
    key: 'text-field',
    part: 'layout',
    type: 'string',
  },
  {
    trans: 'symbol-style.setting.text-color',
    key: 'text-color',
    type: 'color',
  },
  {
    trans: 'symbol-style.setting.opacity',
    key: 'text-opacity',
    type: 'opacity',
  },
  {
    trans: 'symbol-style.setting.size',
    key: 'text-size',
    part: 'layout',
    type: 'unit',
    unit: 'px',
  },
  {
    trans: 'symbol-style.setting.letter-spacing',
    key: 'text-letter-spacing',
    part: 'layout',
    type: 'unit',
    unit: 'em',
  },
  {
    trans: 'symbol-style.setting.line-height',
    key: 'text-line-height',
    part: 'layout',
    type: 'unit',
    unit: 'em',
  },
  {
    trans: 'symbol-style.setting.max-width',
    key: 'text-max-width',
    part: 'layout',
    type: 'unit',
    unit: 'em',
  },
  {
    trans: 'symbol-style.setting.transform',
    key: 'text-transform',
    part: 'layout',
    type: 'chose',
    menu: [
      {
        text: 'none',
        value: 'none',
      },
      {
        text: 'uppercase',
        value: 'uppercase',
      },
      {
        text: 'lowercase',
        value: 'lowercase',
      },
    ],
  },
  { type: 'divider' },
  {
    trans: 'symbol-style.setting.halo-color',
    key: 'text-halo-color',
    type: 'color',
  },
  {
    trans: 'symbol-style.setting.halo-blur',
    key: 'text-halo-blur',
    type: 'unit',
  },
  {
    trans: 'symbol-style.setting.halo-width',
    key: 'text-halo-width',
    type: 'unit',
  },
];
const ICON_STYLE: Tab<SymbolLayer>[] = [
  {
    trans: 'symbol-style.setting.icon-image',
    key: 'icon-image',
    part: 'layout',
    type: 'image',
  },
  {
    trans: 'symbol-style.setting.icon-opacity',
    key: 'icon-opacity',
    type: 'opacity',
  },
  {
    trans: 'symbol-style.setting.icon-size',
    key: 'icon-size',
    part: 'layout',
    type: 'unit',
  },
  {
    trans: 'symbol-style.setting.icon-text-fit',
    key: 'icon-text-fit',
    part: 'layout',
    type: 'chose',
    menu: [
      {
        text: 'none',
        value: 'none',
      },
      {
        text: 'width',
        value: 'width',
      },
      {
        text: 'height',
        value: 'height',
      },
      {
        text: 'both',
        value: 'both',
      },
    ],
  },
  {
    trans: 'symbol-style.setting.icon-text-fit-padding',
    key: 'icon-text-fit-padding',
    part: 'layout',
    type: 'array-index',
    data: [
      {
        text: 'top',
        type: 'number',
        value: 0,
      },
      {
        text: 'right',
        type: 'number',
        value: 0,
      },
      {
        text: 'bottom',
        type: 'number',
        value: 0,
      },
      {
        text: 'left',
        type: 'number',
        value: 0,
      },
    ],
  },
];
const POSITION_STYLE: Tab<SymbolLayer>[] = [
  {
    trans: 'symbol-style.setting.symbol-placement',
    key: 'symbol-placement',
    type: 'chose',
    menu: [
      {
        text: 'point',
        value: 'point',
      },
      {
        text: 'line',
        value: 'line',
      },
      {
        text: 'line-center',
        value: 'line-center',
      },
    ],
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.symbol-spacing',
    key: 'symbol-spacing',
    type: 'unit',
    unit: 'px',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-max-angle',
    key: 'text-max-angle',
    type: 'unit',
    unit: 'deg',
    part: 'layout',
  },

  {
    trans: 'symbol-style.setting.avoid-edges',
    key: 'symbol-avoid-edges',
    type: 'boolean',

    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.sort-key',
    key: 'symbol-sort-key',
    type: 'text',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-orientation',
    key: 'icon-pitch-alignment',
    type: 'chose',
    menu: [
      {
        text: 'map',
        value: 'map',
      },
      {
        text: 'viewport',
        value: 'viewport',
      },
      {
        text: 'auto',
        value: 'auto',
      },
    ],
    text: 'Text orientation',
    part: 'layout',
  },

  {
    trans: 'symbol-style.setting.text-padding',
    key: 'text-padding',
    type: 'unit',
    unit: 'px',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.allow-text-overlap',
    key: 'text-allow-overlap',
    type: 'boolean',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-ignore-placement',
    key: 'text-ignore-placement',
    type: 'boolean',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-optional',
    key: 'text-optional',
    type: 'boolean',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.icon-padding',
    key: 'icon-padding',
    type: 'unit',
    unit: 'px',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.allow-icon-overlap',
    key: 'icon-allow-overlap',
    type: 'boolean',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.icon-ignore-placement',
    key: 'icon-ignore-placement',
    type: 'boolean',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.icon-optional',
    key: 'icon-optional',
    type: 'boolean',
    part: 'layout',
  },
];
const PLACEMENT_STYLE: Tab<SymbolLayer>[] = [
  {
    trans: 'symbol-style.setting.text-justify',
    key: 'text-justify',
    type: 'chose',
    menu: [
      {
        text: 'auto',
        value: 'auto',
      },
      {
        text: 'left',
        subtitle: 'symbol-style.translate.left',
        value: 'left',
      },
      {
        text: 'center',
        value: 'center',
      },
      {
        text: 'right',
        value: 'right',
      },
    ],
    text: 'Text justify',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-anchor',
    key: 'text-anchor',
    type: 'select',
    items: [
      'center',
      'left',
      'right',
      'top',
      'bottom',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ],
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-offset',
    key: 'text-offset',
    type: 'array-x-y',
    unit: 'em',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-radial-offset',
    key: 'text-radial-offset',
    type: 'unit',
    unit: 'em',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-translate',
    key: 'text-translate',
    type: 'array-x-y',
    unit: 'em',
  },
  {
    trans: 'symbol-style.setting.text-rotate',
    key: 'text-rotate',
    type: 'unit',
    unit: 'deg',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.text-pitch-alignment',
    key: 'text-pitch-alignment',
    type: 'chose',
    menu: [
      {
        text: 'auto',
        value: 'auto',
      },
      {
        text: 'map',
        value: 'map',
      },
      {
        text: 'viewport',
        value: 'viewport',
      },
    ],
    text: 'Text justify',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.icon-offset',
    key: 'icon-offset',
    type: 'array-x-y',
    unit: 'em',
    part: 'layout',
  },
  {
    trans: 'symbol-style.setting.icon-translate',
    key: 'icon-translate',
    type: 'array-x-y',
    unit: 'em',
  },

  {
    trans: 'symbol-style.setting.icon-rotate',
    key: 'icon-rotate',
    type: 'unit',
    unit: 'deg',
    part: 'layout',
  },
];
export const SYMBOL_CONFIG: LayerTypeConfig<SymbolLayer> = {
  TAB: {
    type: 'multi',
    tabs: [
      {
        trans: 'symbol-style.tab.text',
        items: TEXT_STYLE,
      },
      {
        trans: 'symbol-style.tab.icon',
        items: ICON_STYLE,
      },
      {
        trans: 'symbol-style.tab.position',
        items: POSITION_STYLE,
      },
      {
        trans: 'symbol-style.tab.placement',
        items: PLACEMENT_STYLE,
      },
    ],
  },
  DEFAULT: {
    type: 'symbol',
    paint: {
      'icon-color': undefined,
      'icon-halo-blur': 0,
      'icon-halo-color': 'rgba(0, 0, 0, 0)',
      'icon-halo-width': 0,
      'icon-opacity': 1,
      'icon-translate': [0, 0],
      'icon-translate-anchor': 'map',

      'text-color': '#000000',
      'text-halo-blur': 0,
      'text-halo-color': 'rgba(0, 0, 0, 0)',
      'text-halo-width': 0,
      'text-opacity': 1,
      'text-translate': [0, 0],
      'text-translate-anchor': 'map',
    },
    layout: {
      'symbol-placement': 'point',
      'symbol-spacing': 250,
      'symbol-avoid-edges': false,
      'symbol-sort-key': undefined,
      'icon-allow-overlap': false,
      'icon-anchor': 'center',
      'icon-image': undefined,
      'icon-offset': [0, 0],
      'icon-optional': false,
      'icon-padding': 2,
      'icon-pitch-alignment': 'auto',
      'icon-rotate': 0,
      'icon-rotation-alignment': 'auto',
      'icon-size': 1,
      'icon-text-fit': 'none',
      'icon-text-fit-padding': [0, 0, 0, 0],
      'icon-keep-upright': false,
      'text-allow-overlap': false,
      'text-anchor': 'center',
      'text-field': '',
      'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
      'text-justify': 'center',
      'text-letter-spacing': 0,
      'text-line-height': 1.2,
      'text-max-angle': 45,
      'text-max-width': 10,
      'text-offset': [0, 0],
      'text-optional': false,
      'text-padding': 2,
      'text-pitch-alignment': 'auto',
      'text-rotate': 0,
      'text-rotation-alignment': 'auto',
      'text-size': 16,
      'text-transform': 'none',
      'text-variable-anchor': undefined,
      'text-writing-mode': undefined,
      'text-keep-upright': true,
      visibility: 'visible',
    },
  },
};
