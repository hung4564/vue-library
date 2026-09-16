import { describe, expect, it } from 'vitest';
import type { Feature } from 'geojson';
import {
  classifyDrawCreateFeature,
  emptyDraftListSnapshot,
  ensureFeatureId,
  getDraftListSnapshot,
  getDrawModeSelectEffects,
  getFeatureEditMode,
} from './draw-control-helpers';
import type { MapDrawDraftOption, MapDrawOption } from './types/index';

describe('draw-control-helpers', () => {
  it('ensureFeatureId copies properties.id onto feature.id', () => {
    const feature = {
      type: 'Feature',
      properties: { id: 'abc' },
      geometry: { type: 'Point', coordinates: [0, 0] },
    } as Feature;
    ensureFeatureId(feature);
    expect(feature.id).toBe('abc');
  });

  it('getDraftListSnapshot returns undefined for non-draft options', () => {
    expect(getDraftListSnapshot(undefined)).toBeUndefined();
    expect(
      getDraftListSnapshot({ drawSupports: [] } as MapDrawOption),
    ).toBeUndefined();
  });

  it('getDraftListSnapshot reads draft items', () => {
    const option = {
      draft: { show: true },
      getDraftItems: () => [{ id: 1, status: 'added' }],
    } as unknown as MapDrawDraftOption;
    expect(getDraftListSnapshot(option)).toEqual({
      items: [{ id: 1, status: 'added' }],
      count: 1,
    });
  });

  it('emptyDraftListSnapshot clears list', () => {
    expect(emptyDraftListSnapshot()).toEqual({ items: [], count: 0 });
  });

  it('classifyDrawCreateFeature treats select as update', () => {
    expect(classifyDrawCreateFeature('select')).toBe('updated');
    expect(classifyDrawCreateFeature('create')).toBe('added');
  });

  it('getDrawModeSelectEffects documents static + map click', () => {
    expect(getDrawModeSelectEffects('select')).toEqual({
      attachMapClick: true,
      drawMode: 'static',
    });
    expect(getDrawModeSelectEffects('delete')).toEqual({
      attachMapClick: true,
      drawMode: 'static',
    });
  });

  it('getFeatureEditMode uses simple_select for Point', () => {
    const point = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [1, 2] },
    } as Feature;
    expect(getFeatureEditMode(point, ['a'])).toEqual({
      mode: 'simple_select',
      options: { featureIds: ['a'] },
    });

    const line = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
    } as Feature;
    expect(getFeatureEditMode(line, ['b'])).toEqual({
      mode: 'direct_select',
      options: { featureId: 'b' },
    });
  });
});
