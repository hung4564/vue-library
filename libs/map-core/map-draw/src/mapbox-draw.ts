/**
 * Re-export @mapbox/mapbox-gl-draw as MapDraw for a stable package surface.
 */
export { default as MapDraw } from '@mapbox/mapbox-gl-draw';
export type {
  DrawCreateEvent,
  DrawDeleteEvent,
  DrawUpdateEvent,
  DrawSelectionChangeEvent,
  DrawModeChangeEvent,
  DrawCustomMode,
  MapboxDrawOptions as MapDrawOptions,
} from '@mapbox/mapbox-gl-draw';

/** Mode id strings used with `changeMode` / `drawSupports`. */
export const DRAW_MODES = {
  STATIC: 'static',
  SIMPLE_SELECT: 'simple_select',
  DIRECT_SELECT: 'direct_select',
  DRAW_POINT: 'draw_point',
  DRAW_LINE_STRING: 'draw_line_string',
  DRAW_POLYGON: 'draw_polygon',
} as const;

export type DrawModeId = (typeof DRAW_MODES)[keyof typeof DRAW_MODES] | string;

/** Options passed to `changeMode` (featureId / featureIds, etc.). */
export type ChangeModeOptions = {
  featureId?: string;
  featureIds?: string[];
  [key: string]: unknown;
};
