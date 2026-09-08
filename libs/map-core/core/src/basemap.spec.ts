import { describe, expect, it } from 'vitest';
import { BaseMapAdapter } from './adapter/BaseMapAdapter';
import { getLowestLayerId } from './adapter/DefaultBaseMapAdapter';
import { INIT_BASEMAPS } from './basemap';
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
    expect(INIT_BASEMAPS.some((b) => b.title === 'Open Street Map')).toBe(
      true,
    );
    for (const item of INIT_BASEMAPS) {
      expect(item.id).toBeDefined();
      expect(item.title).toBeTruthy();
      expect(item.type).toBeTruthy();
    }
  });
});

describe('BaseMapAdapter.getIndexDefault', () => {
  const maps: BaseMapItem[] = [
    { id: 1, title: 'A', type: 'raster', links: [] },
    { id: 2, title: 'B', type: 'raster', links: [], default: true },
    { id: 3, title: 'C', type: 'raster', links: [] },
  ];

  it('resolves by title, id, default flag, then first', () => {
    const adapter = new StubAdapter();
    expect(adapter.getIndexDefault(maps, 'C')?.id).toBe(3);
    expect(adapter.getIndexDefault(maps, '2')?.id).toBe(2);
    expect(adapter.getIndexDefault(maps, '')?.id).toBe(2);
    expect(adapter.getIndexDefault([{ ...maps[0] }], '')?.id).toBe(1);
  });
});

describe('getLowestLayerId', () => {
  it('returns first style layer id or undefined', () => {
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
