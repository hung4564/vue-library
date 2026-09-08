/**
 * Locks `@hungpvq/map-draw` root **runtime** export surface.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const MAP_DRAW_STABLE_RUNTIME_EXPORTS = [
  'DRAW_MODES',
  'DrawService',
  'DrawingType',
  'DrawingTypeName',
  'MAP_DRAW_EVENT',
  'MapDraw',
  'StaticMode',
  'getDrawStyles',
  'getFeatureByMap',
  'getFeatureId',
  'getFirstFeatureByMap',
  'sameFeature',
] as const;

export const MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'DrawError',
  'brightColor',
  'buildInspectQueryBox',
  'generateColoredLayers',
  'generateInspectStyle',
  'getSourcesFromMap',
  'InspectController',
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
