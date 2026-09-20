import { buildCreateControlArchiveMetaChips } from './loaded-source';

describe('buildCreateControlArchiveMetaChips', () => {
  const labels = {
    tileKindVector: 'Vector tiles',
    tileKindRaster: 'Raster tiles',
    format: 'Format',
    zoom: 'Zoom',
    layers: 'Layers',
    bounds: 'Bounds',
  };

  it('summarizes vector archive metadata', () => {
    const chips = buildCreateControlArchiveMetaChips(
      {
        tileKind: 'vector',
        format: 'pbf',
        archiveKind: 'mbtiles',
        minzoom: 0,
        maxzoom: 14,
        sourceLayers: ['roads', 'water'],
        bounds: [-180, -85, 180, 85],
      },
      labels,
    );
    expect(chips).toEqual([
      'Vector tiles',
      'Format: pbf',
      'MBTILES',
      'Zoom: 0–14',
      'Layers: 2',
      'Bounds: -180.00, -85.00 → 180.00, 85.00',
    ]);
  });

  it('summarizes raster archive without layer count', () => {
    const chips = buildCreateControlArchiveMetaChips(
      {
        tileKind: 'raster',
        format: 'png',
        archiveKind: 'pmtiles',
        minzoom: 5,
        maxzoom: 12,
        sourceLayers: [],
      },
      labels,
    );
    expect(chips).toEqual([
      'Raster tiles',
      'Format: png',
      'PMTILES',
      'Zoom: 5–12',
    ]);
  });

  it('returns empty for missing meta', () => {
    expect(buildCreateControlArchiveMetaChips(null, labels)).toEqual([]);
  });
});
