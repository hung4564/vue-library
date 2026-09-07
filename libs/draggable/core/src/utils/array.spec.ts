import { describe, expect, it } from 'vitest';
import { checkIsFirst, checkIsLast } from './array';

describe('checkIsLast', () => {
  it('returns false for empty list', () => {
    expect(checkIsLast('a', [])).toBe(false);
  });

  it('returns true only for the last id', () => {
    expect(checkIsLast('c', ['a', 'b', 'c'])).toBe(true);
    expect(checkIsLast('a', ['a', 'b', 'c'])).toBe(false);
    expect(checkIsLast('b', ['a', 'b', 'c'])).toBe(false);
  });
});

describe('checkIsFirst', () => {
  it('returns false for empty list', () => {
    expect(checkIsFirst('a', [])).toBe(false);
  });

  it('returns true only for the first id', () => {
    expect(checkIsFirst('a', ['a', 'b', 'c'])).toBe(true);
    expect(checkIsFirst('c', ['a', 'b', 'c'])).toBe(false);
  });
});
