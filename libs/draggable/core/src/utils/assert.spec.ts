import { describe, expect, it } from 'vitest';
import { assertDefined } from './assert';

describe('assertDefined', () => {
  it('returns the value when defined', () => {
    expect(assertDefined(0, 'x')).toBe(0);
    expect(assertDefined('', 'x')).toBe('');
    expect(assertDefined(false, 'x')).toBe(false);
  });

  it('throws when value is null or undefined', () => {
    expect(() => assertDefined(undefined, 'missing')).toThrow('missing');
    expect(() => assertDefined(null, 'missing')).toThrow('missing');
  });
});
