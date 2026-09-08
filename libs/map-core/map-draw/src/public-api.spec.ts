/**

 * Locks `@hungpvq/map-draw` root **runtime** export surface.

 */

import { describe, expect, it } from 'vitest';

import * as api from './index';

export const MAP_DRAW_STABLE_RUNTIME_EXPORTS = [
  'DrawService',

  'DrawingType',

  'DrawingTypeName',

  'MAP_DRAW_EVENT',

  'MapDraw',

  'DRAW_MODES',

  'getDrawStyles',

  'getFeatureByMap',

  'getFirstFeatureByMap',
] as const;

export const MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'DrawError',

  'StaticMode',

  'brightColor',

  'generateColoredLayers',

  'generateInspectStyle',

  'getSourcesFromMap',

  'isInspectStyle',

  'markInspectStyle',

  'renderPopup',
] as const;

describe('public API surface', () => {
  it('root runtime exports match Stable + Experimental allowlists', () => {
    const keys = Object.keys(api).sort();

    const expected = [
      ...MAP_DRAW_STABLE_RUNTIME_EXPORTS,

      ...MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS,
    ].sort();

    expect(keys).toEqual(expected);
  });
});
