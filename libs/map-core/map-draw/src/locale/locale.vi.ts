import { deepMergeLocale } from '@hungpvq/map-core';
import {
  DRAW_CONTROL_LOCALE_VI,
  INSPECT_CONTROL_LOCALE_VI,
} from './draw.vi';

/** Vietnamese catalog for map-draw / inspect UI (mirrors {@link MAP_DRAW_LOCALE_EN}). */
export const MAP_DRAW_LOCALE_VI: Record<string, unknown> = deepMergeLocale(
  DRAW_CONTROL_LOCALE_VI,
  INSPECT_CONTROL_LOCALE_VI,
);
