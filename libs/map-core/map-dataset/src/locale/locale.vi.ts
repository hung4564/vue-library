import { deepMergeLocale } from '@hungpvq/map-core';
import { ATTRIBUTE_TABLE_LOCALE_VI } from '../attribute-table/locale/locale.vi';
import { DATASET_CONTROL_LOCALE_VI } from '../extra/dataset-control/locale/locale.vi';
import { LAYER_DETAIL_LOCALE_VI } from '../extra/detail/locale/locale.vi';
import {
  LAYER_CONTROL_LOCALE_VI,
  LAYER_INFO_CONTROL_LOCALE_VI,
} from '../extra/layer-control/locale/locale.vi';
import { IDENTIFY_CONTROL_LOCALE_VI } from '../identify/locale/locale.vi';
import { STYLE_CONTROL_LOCALE_VI } from '../style/locale/locale.vi';

/** Same slice order as {@link MAP_DATASET_LOCALE_EN}. */
const DATASET_VI_SLICES: Record<string, unknown>[] = [
  DATASET_CONTROL_LOCALE_VI,
  LAYER_CONTROL_LOCALE_VI,
  LAYER_INFO_CONTROL_LOCALE_VI,
  LAYER_DETAIL_LOCALE_VI,
  IDENTIFY_CONTROL_LOCALE_VI,
  ATTRIBUTE_TABLE_LOCALE_VI,
  STYLE_CONTROL_LOCALE_VI,
];

/** Vietnamese catalog for map-dataset UI (mirrors {@link MAP_DATASET_LOCALE_EN}). */
export const MAP_DATASET_LOCALE_VI: Record<string, unknown> =
  DATASET_VI_SLICES.reduce(
    (acc, slice) => deepMergeLocale(acc, slice),
    {} as Record<string, unknown>,
  );
