/**
 * Public entry for `@hungpvq/map-dataset/highlight`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 *
 * Cascade/query/resolve helpers are package-internal (relative imports / tests).
 * Paint-layer helpers are also package-internal; consumers use
 * `createHighlightPart` + controller APIs.
 */
export { bindHighlightPickDatasets } from './bind-pick';
export {
  DEFAULT_HIGHLIGHT_DATA,
  DEFAULT_HIGHLIGHT_POINTER,
  DEFAULT_HIGHLIGHT_PRESENTATION,
  DEFAULT_HIGHLIGHT_SELECTION,
  DEFAULT_HIGHLIGHT_STYLE,
} from './cascade';
export {
  destroyHighlightController,
  getHighlightController,
  type HighlightController,
} from './controller';
export type {
  HighlightClearTarget,
  MapDatasetClearPayload,
  MapDatasetClosePayload,
  MapDatasetEvent,
} from './mitt';
export {
  bindHighlightMittBridge,
  cleanHighlightMittBridge,
  destroyHighlightMittBridge,
  emitHighlightAttributeTableClose,
  emitHighlightClear,
  emitHighlightDetailClose,
  emitHighlightIdentifyClose,
  ensureHighlightMittBridge,
  MAP_DATASET_EVENT,
  releaseHighlightMittBridge,
} from './mitt';
export { createHighlightPart, type IHighlightPart } from './part';
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
  HighlightPointerEvent,
  HighlightPointerPolicy,
  HighlightPointOrBox,
  HighlightPopupPosition,
  HighlightPopupPositionFn,
  HighlightPresentation,
  HighlightSelectionOptions,
  HighlightSelectionPolicy,
  HighlightShowOptions,
  HighlightSource,
  HighlightStyle,
} from './types';
