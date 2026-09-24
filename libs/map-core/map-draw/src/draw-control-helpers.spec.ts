import type { Feature } from 'geojson';
import { describe, expect, it, vi } from 'vitest';

import {
  applyFeatureEditMode,
  classifyDrawCreateFeature,
  emptyDraftListSnapshot,
  ensureFeatureId,
  getDraftListSnapshot,
  getDrawCreateModeEffects,
  getDrawModeSelectEffects,
  getFeatureEditMode,
  handleDrawMapClick,
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

  it('getDrawCreateModeEffects documents create + detach click', () => {
    expect(getDrawCreateModeEffects('draw_line_string')).toEqual({
      method: 'create',
      drawMode: 'draw_line_string',
      isDraw: true,
      detachMapClick: true,
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

  it('applyFeatureEditMode calls changeMode', () => {
    const modes: unknown[] = [];
    const control = {
      add: () => ['id1'],
      delete: () => undefined,
      changeMode: (mode: string, options?: Record<string, unknown>) => {
        modes.push([mode, options]);
      },
    };
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
    applyFeatureEditMode(control, line, ['id1']);
    expect(modes).toEqual([['direct_select', { featureId: 'id1' }]]);
  });

  it('handleDrawMapClick select path sets feature and enters edit', async () => {
    const setFeature = vi.fn();
    const detach = vi.fn();
    const feature = {
      type: 'Feature',
      id: 'f1',
      properties: {},
      geometry: { type: 'Point', coordinates: [0, 0] },
    } as Feature;
    const control = {
      add: () => ['f1'],
      delete: vi.fn(),
      changeMode: vi.fn(),
    };
    const result = await handleDrawMapClick({
      method: 'select',
      drawOption: {
        selectFeature: async () => feature,
      } as MapDrawOption,
      control,
      mapId: 'm1',
      point: [1, 2],
      setFeature,
      detachMapClick: detach,
    });
    expect(result.kind).toBe('select');
    expect(setFeature).toHaveBeenCalledWith('updated', feature);
    expect(detach).toHaveBeenCalledOnce();
    expect(control.changeMode).toHaveBeenCalledWith('simple_select', {
      featureIds: ['f1'],
    });
  });
});
