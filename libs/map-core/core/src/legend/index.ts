/**
 * Public entry for `@hungpvq/map-core/legend`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 */
export {
  getLegendName,
  isDisabledLegendLayer,
  isSupportGenLayerLegend,
} from './check';
export { LegendService } from './legend.service';
export { LEGEND_CONTROL_LOCALE } from './locale';
export { MapLegend } from './MapLegend';
export { Circle, Fill, Line, Symbol } from './part';
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
