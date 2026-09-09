/**
 * Locks `@hungpvq/react-map-draw` root **runtime** export surface.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const REACT_MAP_DRAW_STABLE_RUNTIME_EXPORTS = [
  'DRAW_CONTROL_LOCALE',
  'DrawControl',
  'INSPECT_CONTROL_LOCALE',
  'InspectControl',
  'isDraftOption',
  'useConfigDrawControl',
  'useMapDraw',
  'useMapDrawStore',
] as const;

export const REACT_MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...REACT_MAP_DRAW_STABLE_RUNTIME_EXPORTS,
      ...REACT_MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
