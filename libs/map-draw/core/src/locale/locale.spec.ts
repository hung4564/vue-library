import { diffLocaleKeys } from '@hungpvq/map-core';
import { describe, expect, it } from 'vitest';

import { DRAW_CONTROL_LOCALE, INSPECT_CONTROL_LOCALE } from './draw.en';
import { DRAW_CONTROL_LOCALE_VI, INSPECT_CONTROL_LOCALE_VI } from './draw.vi';
import { MAP_DRAW_LOCALE_EN } from './locale.en';
import { MAP_DRAW_LOCALE_VI } from './locale.vi';

const DRAW_SLICE_PAIRS: [
  string,
  Record<string, unknown>,
  Record<string, unknown>,
][] = [
  ['DRAW_CONTROL', DRAW_CONTROL_LOCALE, DRAW_CONTROL_LOCALE_VI],
  ['INSPECT_CONTROL', INSPECT_CONTROL_LOCALE, INSPECT_CONTROL_LOCALE_VI],
];

describe('map-draw locale', () => {
  it('keeps EN and VI catalog key parity', () => {
    const { missingInA, missingInB } = diffLocaleKeys(
      MAP_DRAW_LOCALE_EN,
      MAP_DRAW_LOCALE_VI,
    );
    expect(missingInB).toEqual([]);
    expect(missingInA).toEqual([]);
  });

  it.each(DRAW_SLICE_PAIRS)(
    'keeps %s EN↔VI slice key parity',
    (_name, en, vi) => {
      const { missingInA, missingInB } = diffLocaleKeys(en, vi);
      expect(missingInB).toEqual([]);
      expect(missingInA).toEqual([]);
    },
  );
});
