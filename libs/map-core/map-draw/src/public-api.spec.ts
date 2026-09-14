/**
 * Locks `@hungpvq/map-draw` root **runtime** export surface.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const MAP_DRAW_STABLE_RUNTIME_EXPORTS = [
  'brightColor',
  'buildInspectQueryBox',
  'DRAW_CONTROL_LOCALE',
  'DRAW_MODES',
  'DrawError',
  'DrawingType',
  'DrawingTypeName',
  'DrawService',
  'generateColoredLayers',
  'generateInspectStyle',
  'getDrawStyles',
  'getFeatureByMap',
  'getFeatureId',
  'getFirstFeatureByMap',
  'getSourcesFromMap',
  'INSPECT_CONTROL_LOCALE',
  'InspectController',
  'isDraftOption',
  'isInspectStyle',
  'MAP_DRAW_EVENT',
  'MapDraw',
  'markInspectStyle',
  'renderPopup',
  'sameFeature',
  'StaticMode',
] as const;

export const MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS = [] as const;

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
