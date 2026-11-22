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
const showMany = vi.fn();
const hideIfSource = vi.fn();

vi.mock('../highlight/controller', () => ({
  getHighlightController: () => ({ show, showMany, hideIfSource }),
}));

const point = (id = 'p') => ({
  type: 'Feature' as const,
  id,
  geometry: { type: 'Point' as const, coordinates: [0, 0] },
  properties: { id },
});

describe('highlightResolver', () => {
  beforeEach(() => {
    show.mockReset();
    showMany.mockReset();
    hideIfSource.mockReset();
    setGlobalHighlightResolver(highlightResolver);
    setHighlightResolver('m1', null);
  });

  it('Identify: clears when count is 0', async () => {
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 0,
      features: [],
      sources: ['identify'],
    });
    expect(hideIfSource).toHaveBeenCalledWith('identify');
    expect(show).not.toHaveBeenCalled();
  });

  it('E: AttributeTable paints all selected features (multi)', async () => {
    const a = point('a');
    const b = point('b');
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 2,
      features: [a, b],
      sources: ['attribute-table'],
    });
    expect(hideIfSource).toHaveBeenCalledWith('attribute-table');
    expect(showMany).toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('E: AttributeTable single uses show', async () => {
    const feature = point('one');
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 1,
      features: [feature],
      sources: ['attribute-table'],
    });
    expect(hideIfSource).toHaveBeenCalledWith('attribute-table');
    expect(show).toHaveBeenCalledWith(feature, {
      source: 'attribute-table',
      dataset: undefined,
    });
  });

  it('A: hitAction detail paints source detail', async () => {
    const feature = point('d');
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 1,
      features: [feature],
      hitAction: 'detail',
    });
    expect(show).toHaveBeenCalledWith(feature, {
      source: 'detail',
      dataset: undefined,
    });
  });

  it('B: Identify multi clears without paint', async () => {
    const feature = point('m');
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 2,
      features: [feature, feature],
      sources: ['identify'],
      hitAction: 'result',
    });
    expect(hideIfSource).toHaveBeenCalledWith('identify');
    expect(show).not.toHaveBeenCalled();
    expect(showMany).not.toHaveBeenCalled();
  });

  it('Identify→table: clears identify (table owns paint)', async () => {
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 1,
      features: [point('t')],
      hitAction: 'table',
    });
    expect(hideIfSource).toHaveBeenCalledWith('identify');
    expect(show).not.toHaveBeenCalled();
  });

  it('Identify owns: paints only when exactly one feature', async () => {
    const feature = point('solo');
    await getHighlightResolver('m1').execute({
      mapId: 'm1',
      count: 1,
      features: [feature],
      sources: ['identify'],
      hitAction: 'result',
    });
    expect(show).toHaveBeenCalledWith(feature, {
      source: 'identify',
      dataset: undefined,
    });
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
      features: [point('x')],
    });
    expect(customShow).toHaveBeenCalled();
    expect(show).not.toHaveBeenCalled();
  });

  it('executes from records like getIdentifyResolver', async () => {
    const feature = point('1');
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
