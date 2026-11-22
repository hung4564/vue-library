/**
 * Locks the `@hungpvq/react-map` meta facade runtime surface.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

/** Stable root runtime exports (SemVer contract for 1.x). */
export const REACT_MAP_STABLE_RUNTIME_EXPORTS = ['installMapApp'] as const;

export const REACT_MAP_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...REACT_MAP_STABLE_RUNTIME_EXPORTS,
      ...REACT_MAP_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
