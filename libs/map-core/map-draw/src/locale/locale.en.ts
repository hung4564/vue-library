import { deepMergeLocale } from '@hungpvq/map-core';

import { DRAW_CONTROL_LOCALE, INSPECT_CONTROL_LOCALE } from './draw.en';

/** English catalog for map-draw / inspect UI (mirrors {@link MAP_DRAW_LOCALE_VI}). */
export const MAP_DRAW_LOCALE_EN: Record<string, unknown> = deepMergeLocale(
  DRAW_CONTROL_LOCALE,
  INSPECT_CONTROL_LOCALE,
);
