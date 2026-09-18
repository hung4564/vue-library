import { describe, expect, it } from 'vitest';
import { isUsableMapId } from './is-usable-map-id';

describe('isUsableMapId', () => {
  it('accepts non-empty strings only', () => {
    expect(isUsableMapId('map-1')).toBe(true);
    expect(isUsableMapId('')).toBe(false);
    expect(isUsableMapId(undefined)).toBe(false);
    expect(isUsableMapId(null)).toBe(false);
  });
});
