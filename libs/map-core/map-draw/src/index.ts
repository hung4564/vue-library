/**
 * Root barrel: explicit named exports (Stable).
 * Do not reintroduce `export *`. Direct leaf imports (no internal-barrel).
 */
export {
  DrawingType,
  DrawingTypeName,
} from './drawing-type';

export {
  DrawError,
} from './errors/index';

export {
  brightColor,
} from './inspect/colors';

export {
  InspectController,
  buildInspectQueryBox,
} from './inspect/controller';

export {
  getSourcesFromMap,
  isInspectStyle,
  markInspectStyle,
} from './inspect/inspect';

export {
  renderPopup,
} from './inspect/renderPopup';

export {
  generateColoredLayers,
  generateInspectStyle,
} from './inspect/stylegen';

export {
  isDraftOption,
} from './is-draft-option';

export {
  DRAW_CONTROL_LOCALE,
  INSPECT_CONTROL_LOCALE,
} from './locale';

export { MAP_DRAW_LOCALE_EN } from './locale/locale.en';
export { MAP_DRAW_LOCALE_VI } from './locale/locale.vi';

export {
  DRAW_MODES,
  MapDraw,
} from './mapbox-draw';

export {
  StaticMode,
} from './modes/static-mode';

export {
  DrawService,
} from './services/draw.service';

export {
  createDefaultMapDrawStore,
  runDrawCommit,
  runDrawDiscard,
  runDrawSave,
  runDrawSetFeature,
  runDrawStart,
} from './store-helpers';

export {
  getDrawStyles,
} from './theme/index';

export {
  MAP_DRAW_EVENT,
} from './types/index';

export {
  getFeatureByMap,
  getFeatureId,
  getFirstFeatureByMap,
  sameFeature,
} from './utils/index';

export type {
  InspectControllerOptions,
} from './inspect/controller';

export type {
  InspectStyleSpecification,
} from './inspect/inspect';

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

export type {
  DrawSaveFc,
  DrawSaveFcParams,
  IDraftRecord,
  MapDrawAction,
  MapDrawConfig,
  MapDrawDraftOption,
  MapDrawEvent,
  MapDrawOption,
  MapDrawOptionSimple,
  MapDrawStore,
} from './types/index';

/**
 * @experimental DrawControl adapter helpers — may change in a minor.
 * Prefer importing from `@hungpvq/map-draw` (root only; no subpath yet).
 */
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
  DrawMapClickResult,
  MapDrawEditControl,
} from './draw-control-helpers';

export { createDrawSession } from './draw-session';
export type {
  DrawMapDrawHandlers,
  DrawSession,
  DrawSessionOptions,
  DrawSessionState,
} from './draw-session';

/** @experimental Root logger namespace — may change in a minor. */
export { logger } from './logger';
