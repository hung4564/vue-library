import { describe, expect, it } from 'vitest';
import { createFakeMap } from '../../test/fake-map';
import { BASEMAP_PREFIX, BaseMapLayer } from './BaseMapLayer';

describe('BaseMapLayer', () => {
  it('loads raster sources/layers and add/remove from map', async () => {
    const layer = new BaseMapLayer();
    await layer.setBaseMap({
      id: 1,
      title: 'OSM',
      type: 'raster',
      links: ['https://tile.example/{z}/{x}/{y}.png'],
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
    } as any);
    expect(layer.getBeforeId()).toBeUndefined();
  });
});
