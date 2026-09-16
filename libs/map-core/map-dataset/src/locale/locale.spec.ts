import { describe, expect, it } from 'vitest';
import { diffLocaleKeys } from '@hungpvq/map-core';
import { MAP_DATASET_LOCALE_EN } from './locale.en';
import { MAP_DATASET_LOCALE_VI } from './locale.vi';

describe('map-dataset locale', () => {
  it('keeps EN and VI catalog key parity', () => {
    const { missingInA, missingInB } = diffLocaleKeys(
      MAP_DATASET_LOCALE_EN,
      MAP_DATASET_LOCALE_VI,
    );
    expect(missingInB).toEqual([]);
    expect(missingInA).toEqual([]);
  });
});
