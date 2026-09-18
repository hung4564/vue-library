import { describe, expect, it } from 'vitest';
import { formatNumber } from './number';

describe('formatNumber', () => {
  it('formats numbers for vi and en locales', () => {
    expect(formatNumber(1234.5, 'en')).toMatch(/1,234/);
    expect(formatNumber('10', 'en')).toBe('10');
  });
});
