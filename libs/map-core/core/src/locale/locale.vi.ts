import type { MapLangLocale } from '../types/lang';
import { deepMergeLocale } from '../types/lang';
import { BASEMAP_CONTROL_LOCALE_VI } from '../basemap/locale/locale.vi';
import { CRS_CONTROL_LOCALE_VI } from '../crs/locale/locale.vi';
import { EVENT_CONTROL_LOCALE_VI } from '../event/locale/locale.vi';
import { LEGEND_CONTROL_LOCALE_VI } from '../legend/locale/locale.vi';
import { MEASUREMENT_CONTROL_LOCALE_VI } from '../measurement/locale/locale.vi';
import { PRINT_CONTROL_LOCALE_VI } from '../print/locale/locale.vi';
import { THEME_CONTROL_LOCALE_VI } from '../theme/locale/locale.vi';
import { TOOLBAR_CONTROL_LOCALE_VI } from '../toolbar/locale/locale.vi';
import {
  GLOBE_CONTROL_LOCALE_VI,
  GOTO_CONTROL_LOCALE_VI,
  HOME_CONTROL_LOCALE_VI,
  INFO_CONTROL_LOCALE_VI,
  LANGUAGE_CONTROL_LOCALE_VI,
  MAP_ACTION_LOCALE_VI,
  REGISTRY_CONTROL_LOCALE_VI,
  SETTING_CONTROL_LOCALE_VI,
  WORKER_CONTROL_LOCALE_VI,
} from './shell.vi';

/** Same slice order as {@link MAP_CORE_LOCALE_EN}. */
export const CORE_VI_SLICES: MapLangLocale[] = [
  MAP_ACTION_LOCALE_VI,
  HOME_CONTROL_LOCALE_VI,
  GLOBE_CONTROL_LOCALE_VI,
  INFO_CONTROL_LOCALE_VI,
  GOTO_CONTROL_LOCALE_VI,
  SETTING_CONTROL_LOCALE_VI,
  WORKER_CONTROL_LOCALE_VI,
  REGISTRY_CONTROL_LOCALE_VI,
  LANGUAGE_CONTROL_LOCALE_VI,
  BASEMAP_CONTROL_LOCALE_VI,
  CRS_CONTROL_LOCALE_VI,
  EVENT_CONTROL_LOCALE_VI,
  LEGEND_CONTROL_LOCALE_VI,
  PRINT_CONTROL_LOCALE_VI,
  THEME_CONTROL_LOCALE_VI,
  TOOLBAR_CONTROL_LOCALE_VI,
  MEASUREMENT_CONTROL_LOCALE_VI,
];

/** Vietnamese catalog for shell + map-core domain controls (mirrors {@link MAP_CORE_LOCALE_EN}). */
export const MAP_CORE_LOCALE_VI: MapLangLocale = CORE_VI_SLICES.reduce(
  (acc, slice) => deepMergeLocale(acc, slice),
  {} as MapLangLocale,
);
