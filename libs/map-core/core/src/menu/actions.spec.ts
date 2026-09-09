import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerMapAccessor } from '../store';
import { createFakeMap } from '../test/fake-map';
import {
  centerMapHere,
  formatMapContextCoords,
  identifyFeaturesHere,
  openGoogleEarth,
  openGoogleMaps,
  pointFeatureGeojson,
  pointWkt,
  zoomInMapHere,
} from './actions';
import { UniversalRegistry } from '../registry';
import { MAP_CONTEXT_MENU_ID } from './types';

describe('map-context-menu actions', () => {
  afterEach(() => {
    registerMapAccessor(undefined as any);
    UniversalRegistry.clearMap('m1');
    vi.unstubAllGlobals();
  });

  it('formats coords / geojson / wkt helpers', () => {
    expect(formatMapContextCoords(106.1, 10.2, 2)).toBe('10.20, 106.10');
    expect(JSON.parse(pointFeatureGeojson(1, 2)).geometry.coordinates).toEqual([
      1, 2,
    ]);
    expect(pointWkt(1, 2)).toBe('POINT (1 2)');
  });

  it('center / zoom map actions use registered map accessor', () => {
    const map = createFakeMap();
    registerMapAccessor((id, cb) => {
      if (id === 'm1') {
        cb?.(map as any);
        return map as any;
      }
      return undefined;
    });
    const props = {
      mapId: 'm1',
      layer: { mapId: 'm1', lngLat: { lng: 106, lat: 10 } },
    } as any;

    centerMapHere(props);
    expect(map.easeTo).toHaveBeenCalledWith({ center: [106, 10] });

    zoomInMapHere(props, 3);
    expect(map.easeTo).toHaveBeenCalledWith({
      center: [106, 10],
      zoom: 8,
    });
  });

  it('openGoogleMaps / Earth and identify handler', () => {
    const open = vi.fn();
    vi.stubGlobal('window', { open });
    const target = { mapId: 'm1', lngLat: { lng: 1, lat: 2 } } as any;
    openGoogleMaps(target);
    expect(open).toHaveBeenCalled();
    openGoogleEarth(target);
    expect(open).toHaveBeenCalledTimes(2);

    const handler = vi.fn();
    UniversalRegistry.registerMenuHandlerForMap(
      'm1',
      MAP_CONTEXT_MENU_ID.identifyHere,
      handler,
    );
    identifyFeaturesHere({
      mapId: 'm1',
      layer: target,
    } as any);
    expect(handler).toHaveBeenCalled();
  });
});
