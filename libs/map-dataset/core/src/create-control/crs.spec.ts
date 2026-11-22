import { normalizeEpsgCode } from '@hungpvq/map-core/crs';
import { describe, expect, it } from 'vitest';

import { isCreateControlCrsMismatch } from './crs';

describe('create-control crs', () => {
  it('normalizes EPSG prefixes via normalizeEpsgCode', () => {
    expect(normalizeEpsgCode('EPSG:4326') ?? '').toBe('4326');
    expect(normalizeEpsgCode(' 3857 ') ?? '').toBe('3857');
  });

  it('detects mismatch', () => {
    expect(isCreateControlCrsMismatch('4326', 'EPSG:3857')).toBe(true);
    expect(isCreateControlCrsMismatch('EPSG:4326', '4326')).toBe(false);
    expect(isCreateControlCrsMismatch('4326', null)).toBe(false);
  });
});
