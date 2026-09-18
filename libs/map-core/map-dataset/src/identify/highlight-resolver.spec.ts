import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDefaultHighlightResolver,
  featuresFromIdentifyRecords,
  getHighlightResolver,
  highlightResolver,
  setGlobalHighlightResolver,
  setHighlightResolver,
} from './highlight-resolver';

const show = vi.fn();
const hideIfSource = vi.fn();

vi.mock('../highlight/controller', () => ({
  getHighlightController: () => ({ show, hideIfSource }),
}));

describe('highlightResolver', () => {
  beforeEach(() => {
    show.mockReset();
    hideIfSource.mockReset();
    setGlobalHighlightResolver(highlightResolver);
    setHighlightResolver('m1', null);
  });

  it('clears when count is 0', async () => {
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 0,
      features: [],
      sources: ['identify'],
    });
    expect(hideIfSource).toHaveBeenCalledWith('identify');
    expect(show).not.toHaveBeenCalled();
  });

  it('shows when count is 1', async () => {
    const feature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] },
      properties: {},
    };
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 1,
      features: [feature],
      sources: ['attribute-table'],
    });
    expect(show).toHaveBeenCalledWith(feature, {
      source: 'attribute-table',
      dataset: undefined,
    });
  });

  it('clears when count > 1', async () => {
    const feature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] },
      properties: {},
    };
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 2,
      features: [feature, feature],
      sources: ['identify'],
    });
    expect(hideIfSource).toHaveBeenCalledWith('identify');
    expect(show).not.toHaveBeenCalled();
  });

  it('supports per-map highlight resolver override', async () => {
    const custom = createDefaultHighlightResolver();
    const customShow = vi.fn();
    custom.clear().add({
      when: () => true,
      execute: () => {
        customShow();
      },
    });
    setHighlightResolver('m1', custom);
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 1,
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [0, 0] },
          properties: {},
        },
      ],
    });
    expect(customShow).toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('executes from records like getIdentifyResolver', async () => {
    const feature = {
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [0, 0] },
      properties: {},
    };
    const identify = { id: 'id-1' } as never;
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      records: [
        {
          identify,
          features: [
            {
              id: '1',
              name: 'a',
              data: feature,
            },
          ],
        },
      ],
      sources: ['identify'],
    });
    expect(show).toHaveBeenCalledWith(feature, {
      source: 'identify',
      dataset: identify,
    });
  });
});

describe('featuresFromIdentifyRecords', () => {
  it('converts row data with geometry', () => {
    const features = featuresFromIdentifyRecords([
      {
        identify: {} as never,
        features: [
          {
            id: '1',
            name: 'a',
            data: {
              id: '1',
              geometry: { type: 'Point', coordinates: [1, 2] },
              name: 'a',
            },
          },
        ],
      },
    ]);
    expect(features).toHaveLength(1);
    expect(features[0]?.geometry).toEqual({
      type: 'Point',
      coordinates: [1, 2],
    });
  });
});
