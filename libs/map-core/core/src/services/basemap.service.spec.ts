import { describe, expect, it, vi } from 'vitest';
import { BaseMapAdapter } from '../adapter/BaseMapAdapter';
import type { BaseMapItem } from '../types';
import { BasemapService } from './basemap.service';

class StubAdapter extends BaseMapAdapter {
  applied: BaseMapItem[] = [];
  protected async onApplyBaseMap(_mapId: string, baseMap: BaseMapItem) {
    this.applied.push(baseMap);
  }
}

describe('BasemapService', () => {
  const maps: BaseMapItem[] = [
    { id: 'a', title: 'Alpha', type: 'raster', links: [] },
    { id: 'b', title: 'Beta', type: 'raster', links: [], default: true },
  ];

  it('getDefaultBasemap delegates to adapter.getIndexDefault', () => {
    const adapter = new StubAdapter();
    expect(BasemapService.getDefaultBasemap(maps, 'Beta', adapter)?.id).toBe(
      'b',
    );
    expect(BasemapService.getDefaultBasemap(maps, 'a', adapter)?.id).toBe('a');
  });

  it('switchBasemap sets current via adapter', async () => {
    const adapter = new StubAdapter();
    await BasemapService.switchBasemap('m1', adapter, maps[0]);
    expect(adapter.getCurrent()).toEqual(maps[0]);
    expect(adapter.applied).toEqual([maps[0]]);
  });

  it('switchBasemap wraps adapter failures as BasemapError', async () => {
    const adapter = new StubAdapter();
    vi.spyOn(adapter, 'setCurrent').mockRejectedValue(new Error('boom'));
    await expect(
      BasemapService.switchBasemap('m1', adapter, maps[0]),
    ).rejects.toMatchObject({ code: 'BASEMAP_ERROR' });
  });
});
