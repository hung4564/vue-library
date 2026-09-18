import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMapMock } = vi.hoisted(() => ({
  getMapMock: vi.fn(),
}));

vi.mock('@hungpvq/map-core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hungpvq/map-core')>();
  return {
    ...actual,
    getMap: getMapMock,
    logHelper: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  };
});

import { createIdentifyMapboxComponent, handleMultiIdentify } from './models';

describe('handleMultiIdentify', () => {
  it('returns empty array for empty identifies', async () => {
    await expect(handleMultiIdentify([], 'map-1')).resolves.toEqual([]);
  });

  it('returns features from a single identify getFeatures', async () => {
    const identify = {
      id: 'id-1',
      getFeatures: async () => [
        { id: 'f1', name: 'Feature 1', data: { a: 1 } },
      ],
    };
    const results = await handleMultiIdentify([identify as any], 'map-1');
    expect(results).toHaveLength(1);
    expect(results[0].identify).toBe(identify);
    expect(results[0].features).toEqual([
      { id: 'f1', name: 'Feature 1', data: { a: 1 } },
    ]);
  });
});

describe('createIdentifyMapboxComponent.getFeatures', () => {
  beforeEach(() => {
    getMapMock.mockReset();
  });

  it('resolves without hanging when getList is absent', async () => {
    const identify = createIdentifyMapboxComponent('NoList', {
      field_id: 'id',
      field_name: 'name',
    });

    const mapboxLeaf = {
      type: 'mapbox',
      getName: () => 'layer-a',
      toggleShow: () => undefined,
      setOpacity: () => undefined,
      moveLayer: () => undefined,
      getBeforeId: () => undefined,
      getAllLayerIds: () => ['layer-a'],
      getParent: () => undefined,
      getChildren: () => [],
    };
    identify.getParent = () => mapboxLeaf as never;
    // Default identify includes getList; hang/fix path is when it is absent.
    delete (identify as { getList?: unknown }).getList;

    getMapMock.mockImplementation((_id: string, cb: (map: unknown) => void) => {
      cb({
        getLayer: (id: string) => (id === 'layer-a' ? {} : undefined),
        queryRenderedFeatures: () => [
          {
            id: 'f1',
            layer: { id: 'layer-a' },
            properties: { id: 'f1', name: 'Alpha' },
            geometry: { type: 'Point', coordinates: [106, 10] },
          },
          {
            id: 'f1-dup',
            layer: { id: 'layer-a' },
            properties: { id: 'f1', name: 'Alpha' },
            geometry: { type: 'Point', coordinates: [106, 10] },
          },
        ],
      });
    });

    const rows = await Promise.race([
      identify.getFeatures('map-1', [10, 20]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('getFeatures hung')), 1500),
      ),
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe('f1');
    expect(rows[0].name).toBe('Alpha');
    expect(rows[0].data).toMatchObject({ id: 'f1', name: 'Alpha' });
  });
});
