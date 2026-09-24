/**
 * Root barrel: explicit named exports (Stable).
 * Do not reintroduce `export *`. Direct leaf imports (no internal-barrel).
 */
export { DrawingType, DrawingTypeName } from './drawing-type';
export { DrawError } from './errors/index';
export { brightColor } from './inspect/colors';
export type { InspectControllerOptions } from './inspect/controller';
export { buildInspectQueryBox, InspectController } from './inspect/controller';
export type { InspectStyleSpecification } from './inspect/inspect';
export {
  getSourcesFromMap,
  isInspectStyle,
  markInspectStyle,
} from './inspect/inspect';
export { renderPopup } from './inspect/renderPopup';
export {
  generateColoredLayers,
  generateInspectStyle,
} from './inspect/stylegen';
export { isDraftOption } from './is-draft-option';
export { DRAW_CONTROL_LOCALE, INSPECT_CONTROL_LOCALE } from './locale';
export { MAP_DRAW_LOCALE_EN } from './locale/locale.en';
export { MAP_DRAW_LOCALE_VI } from './locale/locale.vi';
export { registerMapDrawBuiltinLocales } from './locale/register-builtin-locales';
export type {
  ChangeModeOptions,
  DrawCreateEvent,
  DrawCustomMode,
  DrawDeleteEvent,
  DrawModeChangeEvent,
  DrawModeId,
  DrawSelectionChangeEvent,
  DrawUpdateEvent,
  MapDrawOptions,
} from './mapbox-draw';
export { DRAW_MODES, MapDraw } from './mapbox-draw';
export { StaticMode } from './modes/static-mode';
export { ensureMapDrawStore } from './register-domain-store';
export { DrawService } from './services/draw.service';
export {
  createDefaultMapDrawStore,
  runDrawCommit,
  runDrawDiscard,
  runDrawSave,
  runDrawSetFeature,
  runDrawStart,
} from './store-helpers';
export type { MapDrawStoreKey } from './store-key';
export { MAP_DRAW_STORE_KEY } from './store-key';
export { getDrawStyles } from './theme/index';
export type {
  DrawSaveFc,
  DrawSaveFcParams,
  IDraftRecord,
  MapDrawAction,
  MapDrawConfig,
  MapDrawDraftOption,
  MapDrawEndPayload,
  MapDrawEvent,
  MapDrawOption,
  MapDrawOptionSimple,
  MapDrawStore,
} from './types/index';
export { MAP_DRAW_EVENT } from './types/index';
export {
  getFeatureByMap,
  getFeatureId,
  getFirstFeatureByMap,
  sameFeature,
} from './utils/index';

/**
 * @experimental DrawControl adapter helpers — may change in a minor.
 * Prefer importing from `@hungpvq/map-draw` (root only; no subpath yet).
 */
export type {
  DrawMapClickResult,
  MapDrawEditControl,
} from './draw-control-helpers';
export {
  applyFeatureEditMode,
  classifyDrawCreateFeature,
  emptyDraftListSnapshot,
  ensureFeatureId,
  getDraftListSnapshot,
  getDrawCreateModeEffects,
  getDrawModeSelectEffects,
  getFeatureEditMode,
  handleDrawMapClick,
} from './draw-control-helpers';
export type {
  DrawMapDrawHandlers,
  DrawSession,
  DrawSessionOptions,
  DrawSessionState,
} from './draw-session';
export { createDrawSession } from './draw-session';
export type {
  CreateMapDrawControlOptions,
  MapDrawControlHandle,
  MapDrawHostMap,
} from './map-draw-lifecycle';
export { createMapDrawControl } from './map-draw-lifecycle';

/** @experimental Root logger namespace — may change in a minor. */
export { logger } from './logger';
