import { describe, expect, it, vi } from 'vitest';
import mitt from 'mitt';
import { BaseMapAdapter } from './adapter/BaseMapAdapter';
import {
  BasemapManager,
  getOrCreateBasemapManager,
} from './basemap-manager.service';
import { createDefaultBaseMapStore } from './types';
import type { BaseMapItem, MittTypeBaseMap } from './types';

class StubAdapter extends BaseMapAdapter {
  applied: BaseMapItem[] = [];
  opacities: number[] = [];
  delayMs = 0;
  failIds = new Set<string | number>();

  protected async onApplyBaseMap(_mapId: string, baseMap: BaseMapItem) {
    if (this.delayMs > 0) {
      await new Promise((r) => setTimeout(r, this.delayMs));
    }
    if (this.failIds.has(baseMap.id)) {
      throw new Error(`fail:${baseMap.id}`);
    }
    this.applied.push(baseMap);
  }

  public override async setOpacity(_mapId: string, opacity: number) {
    this.opacities.push(opacity);
  }
}

const maps: BaseMapItem[] = [
  { id: 'a', title: 'Alpha', type: 'raster', links: [], thumbnail: '' },
  { id: 'b', title: 'Beta', type: 'raster', links: [], thumbnail: '' },
  { id: 'c', title: 'Gamma', type: 'raster', links: [], thumbnail: '' },
];

describe('BasemapManager', () => {
  it('setCurrent applies basemap and clears loading', async () => {
    const adapter = new StubAdapter();
    const store = createDefaultBaseMapStore(adapter);
    const emitter = mitt<MittTypeBaseMap>();
    const manager = new BasemapManager('m1', store, emitter);

    await manager.setCurrent(maps[0]);

    expect(store.current).toEqual(maps[0]);
    expect(store.loading).toBe(false);
    expect(adapter.applied).toEqual([maps[0]]);
  });

  it('coalesces concurrent setCurrent to latest item', async () => {
    const adapter = new StubAdapter();
    adapter.delayMs = 30;
    const store = createDefaultBaseMapStore(adapter);
    const emitter = mitt<MittTypeBaseMap>();
    const manager = new BasemapManager('m1', store, emitter);

    const p1 = manager.setCurrent(maps[0]);
    const p2 = manager.setCurrent(maps[1]);
    await Promise.all([p1, p2]);

    expect(store.current?.id).toBe('b');
    expect(store.loading).toBe(false);
    expect(adapter.applied.at(-1)?.id).toBe('b');
  });

  it('rolls back current when switch fails and nothing is pending', async () => {
    const adapter = new StubAdapter();
    adapter.failIds.add('b');
    const store = createDefaultBaseMapStore(adapter);
    const emitter = mitt<MittTypeBaseMap>();
    const manager = new BasemapManager('m1', store, emitter);

    await manager.setCurrent(maps[0]);
    expect(store.current?.id).toBe('a');

    await expect(manager.setCurrent(maps[1])).rejects.toMatchObject({
      code: 'BASEMAP_ERROR',
    });
    expect(store.current?.id).toBe('a');
    expect(store.loading).toBe(false);
  });

  it('setOpacity stores value and calls adapter', () => {
    const adapter = new StubAdapter();
    const store = createDefaultBaseMapStore(adapter);
    const emitter = mitt<MittTypeBaseMap>();
    const manager = new BasemapManager('m1', store, emitter);
    const seen: number[] = [];
    emitter.on('map:base-map:set-opacity', (v) => seen.push(v));

    manager.setOpacity(0.55);
    expect(manager.getOpacity()).toBe(0.55);
    expect(store.opacity).toBe(0.55);
    expect(adapter.opacities).toEqual([0.55]);
    expect(seen).toEqual([0.55]);
  });

  it('re-applies opacity after successful switch', async () => {
    const adapter = new StubAdapter();
    const store = createDefaultBaseMapStore(adapter);
    store.opacity = 0.3;
    const emitter = mitt<MittTypeBaseMap>();
    const manager = new BasemapManager('m1', store, emitter);

    await manager.setCurrent(maps[0]);
    expect(adapter.opacities.at(-1)).toBe(0.3);
  });

  it('addBaseMap appends a new item once', () => {
    const adapter = new StubAdapter();
    const store = createDefaultBaseMapStore(adapter);
    store.baseMaps = [maps[0]];
    const emitter = mitt<MittTypeBaseMap>();
    const manager = new BasemapManager('m1', store, emitter);
    const seen: BaseMapItem[][] = [];
    emitter.on('map:base-map:set', (list) => seen.push(list));

    manager.addBaseMap(maps[1]);
    expect(store.baseMaps.map((b) => b.id)).toEqual(['a', 'b']);
    expect(seen.at(-1)?.map((b) => b.id)).toEqual(['a', 'b']);

    manager.addBaseMap(maps[1]);
    expect(store.baseMaps).toHaveLength(2);
  });

  it('removeBaseMap drops item and switches current when needed', async () => {
    const adapter = new StubAdapter();
    const store = createDefaultBaseMapStore(adapter);
    store.baseMaps = [...maps];
    store.defaultBaseMap = 'a';
    const emitter = mitt<MittTypeBaseMap>();
    const manager = new BasemapManager('m1', store, emitter);

    await manager.setCurrent(maps[1]);
    expect(manager.removeBaseMap('b')).toBe(true);
    expect(store.baseMaps.map((b) => b.id)).toEqual(['a', 'c']);
    await vi.waitFor(() => expect(store.current?.id).toBe('a'));

    expect(manager.removeBaseMap('missing')).toBe(false);
  });

  it('getOrCreateBasemapManager attaches manager on the BASEMAP store bag', () => {
    const adapter = new StubAdapter();
    const store = createDefaultBaseMapStore(adapter);
    const emitter = mitt<MittTypeBaseMap>();
    const a = getOrCreateBasemapManager('m1', store, emitter);
    const b = getOrCreateBasemapManager('m1', store, emitter);
    expect(a).toBe(b);
    expect(store.manager).toBe(a);

    const store2 = createDefaultBaseMapStore(adapter);
    const c = getOrCreateBasemapManager('m2', store2, emitter);
    expect(c).not.toBe(a);
    expect(store2.manager).toBe(c);
  });

  it('setDefaultBaseMap compares by id only', async () => {
    const adapter = new StubAdapter();
    const store = createDefaultBaseMapStore(adapter);
    store.baseMaps = maps;
    store.current = { ...maps[0], title: 'Renamed' };
    const emitter = mitt<MittTypeBaseMap>();
    const manager = new BasemapManager('m1', store, emitter);

    const spy = vi.spyOn(manager, 'setCurrent');
    manager.setDefaultBaseMap('a');
    expect(spy).not.toHaveBeenCalled();

    manager.setDefaultBaseMap('b');
    await vi.waitFor(() => expect(spy).toHaveBeenCalled());
  });
});
