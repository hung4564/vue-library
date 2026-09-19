import { describe, expect, it, vi, afterEach } from 'vitest';
import { BaseMapAdapter } from './adapter/BaseMapAdapter';
import { getLowestLayerId } from './adapter/DefaultBaseMapAdapter';
import { BASEMAP_PREFIX } from './model/BaseMapLayer';
import { INIT_BASEMAPS } from './init';
import type { BaseMapItem } from './types';

class StubAdapter extends BaseMapAdapter {
  protected async onApplyBaseMap() {
    return undefined;
  }
}

describe('INIT_BASEMAPS', () => {
  it('includes None + raster presets with titles and ids', () => {
    expect(INIT_BASEMAPS.length).toBeGreaterThanOrEqual(4);
    expect(INIT_BASEMAPS[0]).toMatchObject({
      id: 'null',
      type: 'no-basemap',
      title: 'None',
    });
    expect(INIT_BASEMAPS.some((b) => b.title === 'Open Street Map')).toBe(true);
    for (const item of INIT_BASEMAPS) {
      expect(item.id).toBeDefined();
      expect(typeof item.id === 'string' || typeof item.id === 'number').toBe(
        true,
      );
      expect(item.title).toBeTruthy();
      expect(item.type).toBeTruthy();
      expect(typeof item.thumbnail).toBe('string');
      expect(item.thumbnail.length).toBeGreaterThan(0);
      expect(item.thumbnail).toMatch(/assets\/basemap\/.+\.(svg|png|jpe?g)/);
    }
  });
});

describe('BaseMapAdapter.getIndexDefault', () => {
  const maps: BaseMapItem[] = [
    { id: 1, title: 'A', type: 'raster', links: [], thumbnail: '' },
    { id: 2, title: 'B', type: 'raster', links: [], thumbnail: '', default: true },
    { id: 3, title: 'C', type: 'raster', links: [], thumbnail: '' },
  ];

  it('resolves by id, then title, default flag, then first', () => {
    const adapter = new StubAdapter();
    expect(adapter.getIndexDefault(maps, '3')?.id).toBe(3);
    expect(adapter.getIndexDefault(maps, 'C')?.id).toBe(3);
    expect(adapter.getIndexDefault(maps, '2')?.id).toBe(2);
    expect(adapter.getIndexDefault(maps, '')?.id).toBe(2);
    expect(adapter.getIndexDefault([{ ...maps[0] }], '')?.id).toBe(1);
  });
});

describe('getLowestLayerId', () => {
  it('returns first non-basemap style layer id or undefined', () => {
    expect(
      getLowestLayerId({
        getStyle: () => ({
          layers: [
            { id: `${BASEMAP_PREFIX}layer` },
            { id: 'background' },
            { id: 'roads' },
          ],
        }),
      } as any),
    ).toBe('background');
    expect(
      getLowestLayerId({
        getStyle: () => ({ layers: [{ id: 'background' }, { id: 'roads' }] }),
      } as any),
    ).toBe('background');
    expect(
      getLowestLayerId({ getStyle: () => ({ layers: [] }) } as any),
    ).toBeUndefined();
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});
