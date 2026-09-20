/**
 * Public entry for `@hungpvq/map-dataset/highlight`.
 * Named exports only — see libs/map-core/core/docs/core/stable-api.md.
 *
 * Cascade/query/resolve helpers are package-internal (relative imports / tests).
 * Paint-layer helpers are also package-internal; consumers use
 * `createHighlightPart` + controller APIs.
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
} from './cascade';

export { createHighlightPart, type IHighlightPart } from './part';
export {
  destroyHighlightController,
  getHighlightController,
  type HighlightController,
} from './controller';
export { bindHighlightPickDatasets } from './bind-pick';
export {
  MAP_DATASET_EVENT,
  bindHighlightMittBridge,
  cleanHighlightMittBridge,
  destroyHighlightMittBridge,
  emitHighlightAttributeTableClose,
  emitHighlightClear,
  emitHighlightDetailClose,
  emitHighlightIdentifyClose,
  ensureHighlightMittBridge,
  releaseHighlightMittBridge,
} from './mitt';
export type {
  HighlightClearTarget,
  MapDatasetClearPayload,
  MapDatasetClosePayload,
  MapDatasetEvent,
} from './mitt';
