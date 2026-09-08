/**
 * Locks `@hungpvq/vue-map-draw` root **runtime** export surface.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const VUE_MAP_DRAW_STABLE_RUNTIME_EXPORTS = [
  'DRAW_CONTROL_LOCALE',
  'DrawControl',
  'INSPECT_CONTROL_LOCALE',
  'InspectControl',
  'isDraftOption',
  'useMapDraw',
] as const;

export const VUE_MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'useConfigDrawControl',
  'useMapDrawStore',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();
    const expected = [
      ...VUE_MAP_DRAW_STABLE_RUNTIME_EXPORTS,
      ...VUE_MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();
    expect(keys).toEqual(expected);
  });
});
