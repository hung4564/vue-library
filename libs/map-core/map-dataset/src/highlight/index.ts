/**
 * Public entry for `@hungpvq/map-dataset/highlight`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 *
 * Paint-layer helpers (`ensureHighlightLayers`, `defaultAnimate`, …) are
 * package-internal; consumers use `createHighlightPart` + controller APIs.
 */
export type {
  HighlightAnimateFn,
  HighlightBindPointerOptions,
  HighlightClickAction,
  HighlightDataContext,
  HighlightDataSource,
  HighlightEntry,
  HighlightFilterCreator,
  HighlightGeoJson,
  HighlightLayerIds,
  HighlightLngLat,
  HighlightMode,
  HighlightPartOptions,
  HighlightPickOptions,
  HighlightPointOrBox,
  HighlightPointerEvent,
  HighlightPointerPolicy,
  HighlightPopupPosition,
  HighlightPopupPositionFn,
  HighlightPresentation,
  HighlightSelectionOptions,
  HighlightSelectionPolicy,
  HighlightShowOptions,
  HighlightSource,
  HighlightStyle,
} from './types';

export {
  DEFAULT_HIGHLIGHT_DATA,
  DEFAULT_HIGHLIGHT_POINTER,
  DEFAULT_HIGHLIGHT_PRESENTATION,
  DEFAULT_HIGHLIGHT_SELECTION,
  DEFAULT_HIGHLIGHT_STYLE,
  findHighlightPart,
  partOptionsToStyle,
  resolveData,
  resolvePresentation,
  resolvePresentationForSource,
  resolveSelection,
  resolveShowConfig,
  resolveStyle,
} from './cascade';

export { createHighlightPart, type IHighlightPart } from './part';
export {
  destroyHighlightController,
  getHighlightController,
  type HighlightController,
} from './controller';
export { bindHighlightPickDatasets } from './bind-pick';
export {
  datasetsFromHighlightParts,
  filterDatasetsForPointerEvent,
  queryHighlightAtPoint,
  type HighlightHit,
} from './query';
export {
  mergeEntriesToFeatureCollection,
  normalizeToHighlightGeoJson,
  resolveHighlightData,
} from './resolve-data';
