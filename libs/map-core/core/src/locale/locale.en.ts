import type { MapLangLocale } from '../types/lang';
import { deepMergeLocale } from '../types/lang';
import { BASEMAP_CONTROL_LOCALE } from '../basemap/locale/locale.en';
import { CRS_CONTROL_LOCALE } from '../crs/locale/locale.en';
import { EVENT_CONTROL_LOCALE } from '../event/locale/locale.en';
import { LEGEND_CONTROL_LOCALE } from '../legend/locale/locale.en';
import { MEASUREMENT_CONTROL_LOCALE } from '../measurement/locale/locale.en';
import { PRINT_CONTROL_LOCALE } from '../print/locale/locale.en';
import { THEME_CONTROL_LOCALE } from '../theme/locale/locale.en';
import { TOOLBAR_CONTROL_LOCALE } from '../toolbar/locale/locale.en';
import {
  GLOBE_CONTROL_LOCALE,
  GOTO_CONTROL_LOCALE,
  HOME_CONTROL_LOCALE,
  INFO_CONTROL_LOCALE,
  LANGUAGE_CONTROL_LOCALE,
  MAP_ACTION_LOCALE,
  REGISTRY_CONTROL_LOCALE,
  SETTING_CONTROL_LOCALE,
  WORKER_CONTROL_LOCALE,
} from './shell.en';

/** Same slice order as {@link MAP_CORE_LOCALE_VI}. */
export const CORE_EN_SLICES: MapLangLocale[] = [
  MAP_ACTION_LOCALE,
  HOME_CONTROL_LOCALE,
  GLOBE_CONTROL_LOCALE,
  INFO_CONTROL_LOCALE,
  GOTO_CONTROL_LOCALE,
  SETTING_CONTROL_LOCALE,
  WORKER_CONTROL_LOCALE,
  REGISTRY_CONTROL_LOCALE,
  LANGUAGE_CONTROL_LOCALE,
  BASEMAP_CONTROL_LOCALE,
  CRS_CONTROL_LOCALE,
  EVENT_CONTROL_LOCALE,
  LEGEND_CONTROL_LOCALE,
  PRINT_CONTROL_LOCALE,
  THEME_CONTROL_LOCALE,
  TOOLBAR_CONTROL_LOCALE,
  MEASUREMENT_CONTROL_LOCALE,
];

/** English catalog for shell + map-core domain controls (mirrors {@link MAP_CORE_LOCALE_VI}). */
export const MAP_CORE_LOCALE_EN: MapLangLocale = CORE_EN_SLICES.reduce(
  (acc, slice) => deepMergeLocale(acc, slice),
  {} as MapLangLocale,
);
