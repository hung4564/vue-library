import { describe, expect, it } from 'vitest';

import {
  applyCreateControlLayerName,
  layerNameFromFileName,
  layerNameFromUrl,
  suggestLayerName,
} from './presets';

describe('create-control layer name helpers', () => {
  it('layerNameFromFileName strips path and extension', () => {
    expect(layerNameFromFileName('C:\\data\\roads.geojson')).toBe('roads');
    expect(layerNameFromFileName('parcels.shp')).toBe('parcels');
    expect(layerNameFromFileName('archive.tar.gz')).toBe('archive.tar');
  });

  it('layerNameFromUrl uses the last path segment', () => {
    expect(
      layerNameFromUrl('https://example.com/data/cities.geojson?x=1'),
    ).toBe('cities');
    expect(layerNameFromUrl('https://example.com/tiles/{z}/{x}/{y}.png')).toBe(
      'tiles',
    );
  });

  it('applyCreateControlLayerName fills empty or default names only', () => {
    expect(applyCreateControlLayerName('', 'roads', 'geojson')).toBe('roads');
    expect(
      applyCreateControlLayerName(
        suggestLayerName('geojson'),
        'roads',
        'geojson',
      ),
    ).toBe('roads');
    expect(applyCreateControlLayerName('My layer', 'roads', 'geojson')).toBe(
      'My layer',
    );
  });
});
