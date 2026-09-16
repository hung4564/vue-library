import { describe, expect, it } from 'vitest';
import { diffLocaleKeys } from '@hungpvq/map-core';
import { MAP_DRAW_LOCALE_EN } from './locale.en';
import { MAP_DRAW_LOCALE_VI } from './locale.vi';

describe('map-draw locale', () => {
  it('keeps EN and VI catalog key parity', () => {
    const { missingInA, missingInB } = diffLocaleKeys(
      MAP_DRAW_LOCALE_EN,
      MAP_DRAW_LOCALE_VI,
    );
    expect(missingInB).toEqual([]);
    expect(missingInA).toEqual([]);
  });
});
