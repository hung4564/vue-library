import { describe, expect, it } from 'vitest';
import { diffLocaleKeys } from '@hungpvq/map-core';
import { ATTRIBUTE_TABLE_LOCALE } from '../attribute-table/locale/locale.en';
import { ATTRIBUTE_TABLE_LOCALE_VI } from '../attribute-table/locale/locale.vi';
import { DATASET_CONTROL_LOCALE } from '../extra/dataset-control/locale/locale.en';
import { DATASET_CONTROL_LOCALE_VI } from '../extra/dataset-control/locale/locale.vi';
import { LAYER_DETAIL_LOCALE } from '../extra/detail/locale/locale.en';
import { LAYER_DETAIL_LOCALE_VI } from '../extra/detail/locale/locale.vi';
import {
  LAYER_CONTROL_LOCALE,
  LAYER_INFO_CONTROL_LOCALE,
} from '../extra/layer-control/locale/locale.en';
import {
  LAYER_CONTROL_LOCALE_VI,
  LAYER_INFO_CONTROL_LOCALE_VI,
} from '../extra/layer-control/locale/locale.vi';
import { IDENTIFY_CONTROL_LOCALE } from '../identify/locale/locale.en';
import { IDENTIFY_CONTROL_LOCALE_VI } from '../identify/locale/locale.vi';
import { STYLE_CONTROL_LOCALE } from '../style/locale/locale.en';
import { STYLE_CONTROL_LOCALE_VI } from '../style/locale/locale.vi';
import { MAP_DATASET_LOCALE_EN } from './locale.en';
import { MAP_DATASET_LOCALE_VI } from './locale.vi';

const DATASET_SLICE_PAIRS: [string, Record<string, unknown>, Record<string, unknown>][] = [
  ['DATASET_CONTROL', DATASET_CONTROL_LOCALE, DATASET_CONTROL_LOCALE_VI],
  ['LAYER_CONTROL', LAYER_CONTROL_LOCALE, LAYER_CONTROL_LOCALE_VI],
  ['LAYER_INFO_CONTROL', LAYER_INFO_CONTROL_LOCALE, LAYER_INFO_CONTROL_LOCALE_VI],
  ['LAYER_DETAIL', LAYER_DETAIL_LOCALE, LAYER_DETAIL_LOCALE_VI],
  ['IDENTIFY_CONTROL', IDENTIFY_CONTROL_LOCALE, IDENTIFY_CONTROL_LOCALE_VI],
  ['ATTRIBUTE_TABLE', ATTRIBUTE_TABLE_LOCALE, ATTRIBUTE_TABLE_LOCALE_VI],
  ['STYLE_CONTROL', STYLE_CONTROL_LOCALE, STYLE_CONTROL_LOCALE_VI],
];

describe('map-dataset locale', () => {
  it('keeps EN and VI catalog key parity', () => {
    const { missingInA, missingInB } = diffLocaleKeys(
      MAP_DATASET_LOCALE_EN,
      MAP_DATASET_LOCALE_VI,
    );
    expect(missingInB).toEqual([]);
    expect(missingInA).toEqual([]);
  });

  it.each(DATASET_SLICE_PAIRS)(
    'keeps %s EN↔VI slice key parity',
    (_name, en, vi) => {
      const { missingInA, missingInB } = diffLocaleKeys(en, vi);
      expect(missingInB).toEqual([]);
      expect(missingInA).toEqual([]);
    },
  );
});
