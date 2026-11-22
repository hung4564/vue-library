/**
 * Public entry for `@hungpvq/map-dataset/style`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export { applyStyleTabValue, applyStyleZoom } from './apply-style-patch';
export type { StyleTabComponentMap } from './config-tabs';
export { buildConfigTabs, CONFIG_TAB_BASE } from './config-tabs';
export type {
  BuildSimpleStyleLayersOptions,
  ILayerMapboxBuild,
  LayerStyleType,
  SimpleStyleLayerSpec,
} from './layer-simple-builder';
export {
  buildAutoVectorTileStyleLayers,
  buildSimpleStyleLayers,
  getDefaultLayer,
  LayerRasterMapboxBuild,
  LayerSimpleMapboxBuild,
} from './layer-simple-builder';
export {
  circleStyleLang,
  fillStyleLang,
  lineStyleLang,
  rasterStyleLang,
  STYLE_CONTROL_LOCALE,
  styleControlLang,
  symbolStyleLang,
} from './locale';
export type {
  ArrayIndexTab,
  ChoseTab,
  SelectTab,
  Tab,
  TabConfig,
} from './type';
export {
  CIRCLE_CONFIG,
  convertTabWithDefaultConfig,
  DEFAULT_VALUE,
  FILL_CONFIG,
  LINE_CONFIG,
  RASTER_CONFIG,
  SYMBOL_CONFIG,
  TABS,
} from './type';
