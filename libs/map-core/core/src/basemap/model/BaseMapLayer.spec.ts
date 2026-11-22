import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFakeMap } from '../../test/fake-map';
import { BASEMAP_PREFIX, BaseMapLayer } from './BaseMapLayer';

describe('BaseMapLayer', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads raster sources/layers and add/remove from map', async () => {
    const layer = new BaseMapLayer();
    await layer.setBaseMap({
      id: 1,
      title: 'OSM',
      type: 'raster',
      links: ['https://tile.example/{z}/{x}/{y}.png'],
      thumbnail: '',
      maxzoom: 18,
    });

    expect(layer.getBeforeId()).toBe(`${BASEMAP_PREFIX}layer`);

    const map = createFakeMap();
    layer.addToMap(map as any);
    expect(map.getSource(`${BASEMAP_PREFIX}source`)).toBeTruthy();
    expect(map.getLayer(`${BASEMAP_PREFIX}layer`)).toBeTruthy();

    layer.removeFromMap(map as any);
    expect(map.getSource(`${BASEMAP_PREFIX}source`)).toBeUndefined();
    expect(map.getLayer(`${BASEMAP_PREFIX}layer`)).toBeUndefined();
  });

  it('loads empty style for no-basemap', async () => {
    const layer = new BaseMapLayer();
    await layer.setBaseMap({
      id: 'null',
      title: 'None',
      type: 'no-basemap',
      link: '',
      thumbnail: '',
    } as any);
    expect(layer.getBeforeId()).toBeUndefined();
  });

  it('applies vector glyphs/sprite without setStyle', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: async () => ({
          glyphs: 'https://example.com/fonts/{fontstack}/{range}.pbf',
          sprite: 'https://example.com/sprite',
          sources: {
            openmaptiles: {
              type: 'vector',
              tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
            },
          },
          layers: [
            {
              id: 'water',
              type: 'fill',
              source: 'openmaptiles',
              'source-layer': 'water',
            },
          ],
        }),
      }),
    );

    const layer = new BaseMapLayer();
    await layer.setBaseMap({
      id: 'v1',
      title: 'Vector',
      type: 'vector',
      links: ['https://example.com/style.json'],
      thumbnail: '',
    });

    const style = { layers: [] as { id: string }[], glyphs: '', sprite: '' };
    const map = {
      ...createFakeMap(),
      getStyle: () => style,
      setGlyphs: vi.fn(),
      setSprite: vi.fn(),
      setStyle: vi.fn(),
      getSource: () => undefined,
      addSource: vi.fn(),
      getLayer: () => undefined,
      addLayer: vi.fn(),
    };

    layer.addToMap(map as any);

    expect(map.setGlyphs).toHaveBeenCalledWith(
      'https://example.com/fonts/{fontstack}/{range}.pbf',
    );
    expect(map.setSprite).toHaveBeenCalledWith('https://example.com/sprite');
    expect(map.setStyle).not.toHaveBeenCalled();
    expect(map.addSource).toHaveBeenCalled();
    expect(map.addLayer).toHaveBeenCalled();
  });

  it('setOpacity applies raster-opacity paint', async () => {
    const layer = new BaseMapLayer();
    await layer.setBaseMap({
      id: 1,
      title: 'OSM',
      type: 'raster',
      links: ['https://tile.example/{z}/{x}/{y}.png'],
      thumbnail: '',
    });
    const map = createFakeMap();
    layer.addToMap(map as any);
    layer.setOpacity(map as any, 0.4);
    expect(map.setPaintProperty).toHaveBeenCalledWith(
      `${BASEMAP_PREFIX}layer`,
      'raster-opacity',
      0.4,
    );
  });
});
