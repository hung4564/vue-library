/**
 * Public entry for `@hungpvq/map-dataset/style`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
import styleControlLang from './lang/style-control.json';
import circleStyleLang from './lang/style/circle-style.json';
import fillStyleLang from './lang/style/fill-style.json';
import lineStyleLang from './lang/style/line-style.json';
import rasterStyleLang from './lang/style/raster-style.json';
import symbolStyleLang from './lang/style/symbol-style.json';

export {
  CIRCLE_CONFIG,
  DEFAULT_VALUE,
  FILL_CONFIG,
  LINE_CONFIG,
  RASTER_CONFIG,
  SYMBOL_CONFIG,
  TABS,
  convertTabWithDefaultConfig,
} from './type';
export type {
  ArrayIndexTab,
  ChoseTab,
  SelectTab,
  Tab,
  TabConfig,
} from './type';
export {
  LayerRasterMapboxBuild,
  LayerSimpleMapboxBuild,
  getDefaultLayer,
} from './layer-simple-builder';
export type { ILayerMapboxBuild, LayerStyleType } from './layer-simple-builder';

export {
  styleControlLang,
  circleStyleLang,
  fillStyleLang,
  lineStyleLang,
  rasterStyleLang,
  symbolStyleLang,
};

export const STYLE_CONTROL_LOCALE = {
  map: { 'style-control': styleControlLang },
  'circle-style': circleStyleLang,
  'line-style': lineStyleLang,
  'fill-style': fillStyleLang,
  'symbol-style': symbolStyleLang,
  'raster-style': rasterStyleLang,
};
