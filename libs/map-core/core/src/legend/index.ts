/**
 * Public entry for `@hungpvq/map-core/legend`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export {
  buildLayerLegendElements,
  LAYER_LEGEND_FALLBACK_PATHS,
} from './buildLayerLegendElements';
export type { LayerLegendSource } from './buildLayerLegendElements';
export {
  getLegendName,
  isDisabledLegendLayer,
  isSupportGenLayerLegend,
} from './check';
export { LegendService } from './legend.service';
export { LEGEND_CONTROL_LOCALE } from './locale';
export { MapLegend } from './MapLegend';
export { default as Circle } from './part/Circle';
export { default as Fill } from './part/Fill';
export { default as Line } from './part/Line';
export { default as Symbol } from './part/Symbol';
export { cache, exprHandler, mapImageToDataURL } from './util';

export type {
  ExprHandlerFn,
  ExprReturn,
  LayerBranch,
  LayerConfig,
  LayerObjectKeys,
  LegendElement,
  LegendItem,
  LegendLayerSpecification,
  PropsLegendOption,
} from './types';
