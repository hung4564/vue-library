import { describe, expect, it, vi } from 'vitest';
import type { Feature } from 'geojson';
import { DrawService } from './draw.service';
import type { MapDrawStore } from '../types';

vi.mock('@hungpvq/shared-log', () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    getNamespace: vi.fn(() => 'draw'),
    setNamespace: vi.fn(function (this: unknown) {
      return this;
    }),
  };
  return {
    loggerFactory: {
      createLogger: () => ({
        setNamespace: () => logger,
      }),
    },
  };
});

function point(id: string, coords: [number, number] = [0, 0]): Feature {
  return {
    type: 'Feature',
    id,
    properties: { id },
    geometry: { type: 'Point', coordinates: coords },
  };
}

function emptyStore(config?: MapDrawStore['config']): MapDrawStore {
  return {
    config,
    state: {
      featuresAdded: {},
      featuresUpdated: {},
      featuresDeleted: {},
    },
  };
}

describe('DrawService', () => {
  it('setFeature marks added features and assigns id when missing', () => {
    const store = emptyStore();
    const feature = point('a');
    delete (feature as { id?: string }).id;
    feature.properties = {};
    DrawService.setFeature(store, 'added', feature, 'map-1');
    expect(feature.id).toBeTruthy();
    expect(store.state.featuresAdded[feature.id!]).toBe(true);
  });

  it('setFeature updated clears prior added flag (select-for-edit)', () => {
    const store = emptyStore();
    const feature = point('a');
    DrawService.setFeature(store, 'added', feature, 'map-1');
    DrawService.setFeature(store, 'updated', feature, 'map-1');
    expect(store.state.featuresAdded['a']).toBeUndefined();
    expect(store.state.featuresUpdated['a']).toBe(true);
  });

  it('setFeature deleted drops newly-added features without recording delete', () => {
    const store = emptyStore();
    const feature = point('a');
    DrawService.setFeature(store, 'added', feature, 'map-1');
    DrawService.setFeature(store, 'deleted', feature, 'map-1');
    expect(store.state.featuresAdded['a']).toBeUndefined();
    expect(store.state.featuresDeleted['a']).toBeUndefined();
  });

  it('setFeature deleted records existing features', () => {
    const store = emptyStore();
    const feature = point('b', [1, 1]);
    DrawService.setFeature(store, 'deleted', feature, 'map-1');
    expect(store.state.featuresDeleted['b']).toEqual(feature);
  });

  it('convertData splits added vs updated and stamps properties.id on adds', () => {
    const store = emptyStore();
    store.state.featuresAdded['a'] = true;
    store.state.featuresUpdated['b'] = true;
    const added = point('a');
    added.properties = {};
    const result = DrawService.convertData(store, {
      type: 'FeatureCollection',
      features: [added, point('b', [1, 1])],
    });
    expect(Object.keys(result.added)).toEqual(['a']);
    expect(Object.keys(result.updated)).toEqual(['b']);
    expect(result.added['a'].properties?.['id']).toBe('a');
  });

  it('clearDraw resets tracking state', () => {
    const store = emptyStore();
    store.state.featuresAdded['a'] = true;
    store.state.featuresUpdated['b'] = true;
    store.state.featuresDeleted['c'] = point('c');
    DrawService.clearDraw(store);
    expect(store.state.featuresAdded).toEqual({});
    expect(store.state.featuresUpdated).toEqual({});
    expect(store.state.featuresDeleted).toEqual({});
  });

  it('saveDraw select→edit→save calls updateFeature with stable id', async () => {
    const addFeature = vi.fn(async () => undefined);
    const updateFeature = vi.fn(async () => undefined);
    const deleteFeature = vi.fn(async () => undefined);
    const store = emptyStore({
      drawSupports: [],
      cleanAfterDone: true,
      addFeature,
      updateFeature,
      deleteFeature,
      selectFeature: async () => undefined,
      redraw: () => undefined,
    });
    const existing = point('stable-1', [10, 20]);
    // Mimic edit: draw.create after select would wrongly mark added; updated wins.
    DrawService.setFeature(store, 'added', existing, 'map-1');
    DrawService.setFeature(store, 'updated', existing, 'map-1');
    const edited = point('stable-1', [11, 21]);

    const callback = vi.fn();
    await DrawService.saveDraw(
      store,
      { type: 'FeatureCollection', features: [edited] },
      'map-1',
      callback,
    );

    expect(addFeature).not.toHaveBeenCalled();
    expect(updateFeature).toHaveBeenCalledTimes(1);
    expect(updateFeature.mock.calls[0][0].id).toBe('stable-1');
    expect(deleteFeature).not.toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
    expect(store.state.featuresUpdated).toEqual({});
  });

  it('saveDraw delete path invokes deleteFeature then clears', async () => {
    const deleteFeature = vi.fn(async () => undefined);
    const store = emptyStore({
      drawSupports: [],
      cleanAfterDone: true,
      addFeature: async () => undefined,
      updateFeature: async () => undefined,
      deleteFeature,
      selectFeature: async () => undefined,
      redraw: () => undefined,
    });
    const doomed = point('del-1');
    DrawService.setFeature(store, 'deleted', doomed, 'map-1');

    await DrawService.saveDraw(
      store,
      { type: 'FeatureCollection', features: [] },
      'map-1',
    );

    expect(deleteFeature).toHaveBeenCalledWith(
      doomed,
      expect.objectContaining({ mapId: 'map-1' }),
    );
    expect(store.state.featuresDeleted).toEqual({});
  });

  it('saveDraw add path stamps properties.id for promoteId sources', async () => {
    const addFeature = vi.fn(async () => undefined);
    const store = emptyStore({
      drawSupports: [],
      cleanAfterDone: true,
      addFeature,
      updateFeature: async () => undefined,
      deleteFeature: async () => undefined,
      selectFeature: async () => undefined,
      redraw: () => undefined,
    });
    const created = point('new-1');
    created.properties = {};
    DrawService.setFeature(store, 'added', created, 'map-1');

    await DrawService.saveDraw(
      store,
      { type: 'FeatureCollection', features: [created] },
      'map-1',
    );

    expect(addFeature).toHaveBeenCalled();
    expect(addFeature.mock.calls[0][0].properties?.['id']).toBe('new-1');
  });
});
