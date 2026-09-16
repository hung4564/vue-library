/**
 * Public entry for `@hungpvq/map-dataset/style`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
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
export { CONFIG_TAB_BASE, buildConfigTabs } from './config-tabs';
export type { StyleTabComponentMap } from './config-tabs';
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
  STYLE_CONTROL_LOCALE,
  styleControlLang,
  circleStyleLang,
  fillStyleLang,
  lineStyleLang,
  rasterStyleLang,
  symbolStyleLang,
} from './locale';
