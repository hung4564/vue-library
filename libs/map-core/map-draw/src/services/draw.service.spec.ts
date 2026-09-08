import { describe, expect, it, vi } from 'vitest';
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

function emptyStore(): MapDrawStore {
  return {
    state: {
      featuresAdded: {},
      featuresUpdated: {},
      featuresDeleted: {},
    },
  };
}

describe('DrawService', () => {
  it('setFeature marks added features', () => {
    const store = emptyStore();
    DrawService.setFeature(
      store,
      'added',
      { type: 'Feature', id: 'a', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } },
      'map-1',
    );
    expect(store.state.featuresAdded['a']).toBe(true);
  });

  it('setFeature updated clears prior added flag', () => {
    const store = emptyStore();
    const feature = {
      type: 'Feature' as const,
      id: 'a',
      properties: {},
      geometry: { type: 'Point' as const, coordinates: [0, 0] },
    };
    DrawService.setFeature(store, 'added', feature, 'map-1');
    DrawService.setFeature(store, 'updated', feature, 'map-1');
    expect(store.state.featuresAdded['a']).toBeUndefined();
    expect(store.state.featuresUpdated['a']).toBe(true);
  });

  it('convertData splits added vs updated', () => {
    const store = emptyStore();
    store.state.featuresAdded['a'] = true;
    store.state.featuresUpdated['b'] = true;
    const result = DrawService.convertData(store, {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          id: 'a',
          properties: {},
          geometry: { type: 'Point', coordinates: [0, 0] },
        },
        {
          type: 'Feature',
          id: 'b',
          properties: {},
          geometry: { type: 'Point', coordinates: [1, 1] },
        },
      ],
    });
    expect(Object.keys(result.added)).toEqual(['a']);
    expect(Object.keys(result.updated)).toEqual(['b']);
  });

  it('clearDraw resets tracking state', () => {
    const store = emptyStore();
    store.state.featuresAdded['a'] = true;
    DrawService.clearDraw(store);
    expect(store.state.featuresAdded).toEqual({});
  });

  it('saveDraw runs CRUD callbacks then clears', async () => {
    const addFeature = vi.fn(async () => undefined);
    const store: MapDrawStore = {
      config: {
        drawSupports: [],
        cleanAfterDone: true,
        addFeature,
        updateFeature: async () => undefined,
        deleteFeature: async () => undefined,
        selectFeature: async () => undefined,
        redraw: () => undefined,
      },
      state: {
        featuresAdded: { a: true },
        featuresUpdated: {},
        featuresDeleted: {},
      },
    };
    const callback = vi.fn();
    await DrawService.saveDraw(
      store,
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            id: 'a',
            properties: {},
            geometry: { type: 'Point', coordinates: [0, 0] },
          },
        ],
      },
      'map-1',
      callback,
    );
    expect(addFeature).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
    expect(store.state.featuresAdded).toEqual({});
  });
});
