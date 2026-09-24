import { describe, expect, it, vi } from 'vitest';

import type { MapSimple } from '../types';
import {
  createMeasurementMapView,
  createMeasurementMapViewEmptySource,
  createMeasurementMapViewLayers,
  MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR,
  MEASUREMENT_MAP_VIEW_IMAGE,
} from './map-view-layers';

describe('measurement MapView layer bootstrap', () => {
  it('createMeasurementMapViewLayers uses default highlight color', () => {
    const layers = createMeasurementMapViewLayers();
    expect(layers).toHaveLength(5);
    expect(layers[0]).toMatchObject({
      type: 'line',
      paint: {
        'line-color': MEASUREMENT_DEFAULT_HIGHLIGHT_COLOR,
        'line-width': 2,
      },
    });
    expect(layers[2].layout).toMatchObject({
      'icon-image': MEASUREMENT_MAP_VIEW_IMAGE.azimuthArrow,
    });
    expect(layers[4].layout).toMatchObject({
      'icon-image': MEASUREMENT_MAP_VIEW_IMAGE.round,
    });
  });

  it('createMeasurementMapViewLayers accepts a custom color', () => {
    const layers = createMeasurementMapViewLayers('#ff0000');
    expect(layers[0].paint).toMatchObject({ 'line-color': '#ff0000' });
    expect(layers[1].paint).toMatchObject({ 'fill-color': '#ff0000' });
    expect(layers[3].paint).toMatchObject({ 'text-halo-color': '#ff0000' });
  });

  it('createMeasurementMapViewEmptySource is an empty FeatureCollection', () => {
    expect(createMeasurementMapViewEmptySource()).toEqual({
      data: {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      },
    });
  });

  it('createMeasurementMapView adds source + layers on the map', () => {
    const addSource = vi.fn();
    const addLayer = vi.fn();
    const map = { addSource, addLayer } as unknown as MapSimple;
    const view = createMeasurementMapView(map);
    expect(view).toBeTruthy();
    expect(addSource).toHaveBeenCalledTimes(1);
    expect(addLayer).toHaveBeenCalledTimes(5);
    const sourceArg = addSource.mock.calls[0][1];
    expect(sourceArg).toMatchObject({
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
  });
});
