import { ATTRIBUTE_TABLE_LOCALE } from '../attribute-table/locale/locale.en';
import { DATASET_CONTROL_LOCALE } from '../extra/dataset-control/locale/locale.en';
import { LAYER_DETAIL_LOCALE } from '../extra/detail/locale/locale.en';
import {
  LAYER_CONTROL_LOCALE,
  LAYER_INFO_CONTROL_LOCALE,
} from '../extra/layer-control/locale/locale.en';
import { IDENTIFY_CONTROL_LOCALE } from '../identify/locale/locale.en';
import { STYLE_CONTROL_LOCALE } from '../style/index';

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = out[key];
    if (
      sv &&
      typeof sv === 'object' &&
      !Array.isArray(sv) &&
      tv &&
      typeof tv === 'object' &&
      !Array.isArray(tv)
    ) {
      out[key] = deepMerge(
        tv as Record<string, unknown>,
        sv as Record<string, unknown>,
      );
    } else {
      out[key] = sv;
    }
  }
  return out;
}

const DATASET_EN_SLICES: Record<string, unknown>[] = [
  DATASET_CONTROL_LOCALE,
  LAYER_CONTROL_LOCALE,
  LAYER_INFO_CONTROL_LOCALE,
  LAYER_DETAIL_LOCALE,
  IDENTIFY_CONTROL_LOCALE,
  ATTRIBUTE_TABLE_LOCALE,
  STYLE_CONTROL_LOCALE,
];

/** English catalog for map-dataset UI (mirrors {@link MAP_DATASET_LOCALE_VI}). */
export const MAP_DATASET_LOCALE_EN: Record<string, unknown> =
  DATASET_EN_SLICES.reduce(
    (acc, slice) => deepMerge(acc, slice),
    {} as Record<string, unknown>,
  );
