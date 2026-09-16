/**
 * Locks `@hungpvq/map-draw` root **runtime** export surface.
 */
import { describe, expect, it } from 'vitest';
import * as api from './index';

export const MAP_DRAW_STABLE_RUNTIME_EXPORTS = [
  'brightColor',
  'buildInspectQueryBox',
  'createDefaultMapDrawStore',
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
  'MAP_DRAW_LOCALE_EN',
  'MAP_DRAW_LOCALE_VI',
  'InspectController',
  'isDraftOption',
  'isInspectStyle',
  'MAP_DRAW_EVENT',
  'MapDraw',
  'markInspectStyle',
  'renderPopup',
  'runDrawCommit',
  'runDrawDiscard',
  'runDrawSave',
  'runDrawSetFeature',
  'runDrawStart',
  'sameFeature',
  'StaticMode',
] as const;

/** Adapter helpers + logger — may change in a minor. */
export const MAP_DRAW_EXPERIMENTAL_RUNTIME_EXPORTS = [
  'classifyDrawCreateFeature',
  'emptyDraftListSnapshot',
  'ensureFeatureId',
  'getDraftListSnapshot',
  'getDrawModeSelectEffects',
  'getFeatureEditMode',
  'logger',
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
