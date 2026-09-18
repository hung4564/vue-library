import { describe, expect, it } from 'vitest';
import { mergeFilters } from './filter';

describe('mergeFilters', () => {
  it('returns null for empty input', () => {
    expect(mergeFilters([])).toBeNull();
    expect(mergeFilters([null, undefined])).toBeNull();
  });

  it('returns single filter unchanged', () => {
    const filter = ['==', 'a', 1] as never;
    expect(mergeFilters([filter])).toBe(filter);
  });

  it('wraps multiple filters with all/any', () => {
    const a = ['==', 'a', 1] as never;
    const b = ['==', 'b', 2] as never;
    expect(mergeFilters([a, b])).toEqual(['all', a, b]);
    expect(mergeFilters([a, b], 'any')).toEqual(['any', a, b]);
  });
});
