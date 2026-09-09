import { describe, expect, it } from 'vitest';
import { isCreateControlCrsMismatch, normalizeCrsCode } from './crs';

describe('create-control crs', () => {
  it('normalizes EPSG prefixes', () => {
    expect(normalizeCrsCode('EPSG:4326')).toBe('4326');
    expect(normalizeCrsCode(' 3857 ')).toBe('3857');
  });

  it('detects mismatch', () => {
    expect(isCreateControlCrsMismatch('4326', 'EPSG:3857')).toBe(true);
    expect(isCreateControlCrsMismatch('EPSG:4326', '4326')).toBe(false);
    expect(isCreateControlCrsMismatch('4326', null)).toBe(false);
  });
});
