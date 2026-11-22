import { describe, expect, it } from 'vitest';

import { TILEJSON_SAMPLES } from '../vector-tile/samples';
import {
  ConfigTilejsonHelper,
  LAYER_TYPES,
  normalizeLayerType,
} from './form-create';
import { getCreateControlSamples } from './presets';
import { tileJsonToCreateControlPatch } from './upload-helpers';

const DEMO_TILEJSON = {
  tilejson: '3.0.0',
  name: 'MapLibre demotiles',
  format: 'pbf',
  tiles: ['https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf'],
  bounds: [-180, -85.051129, 180, 85.051129],
  minzoom: 0,
  maxzoom: 5,
  vector_layers: [
    {
      id: 'countries',
      fields: { ADM0_A3: 'String', NAME: 'String' },
      minzoom: 0,
      maxzoom: 5,
    },
  ],
};

describe('CreateControl TileJSON', () => {
  it('exposes tilejson in LAYER_TYPES and samples', () => {
    expect(LAYER_TYPES.tilejson).toBe('TileJSON');
    expect(normalizeLayerType('tilejson')).toBe('tilejson');
    expect(normalizeLayerType('vectortile')).toBe('xyz');
    expect(getCreateControlSamples('tilejson')).toEqual(TILEJSON_SAMPLES);
    expect(TILEJSON_SAMPLES[0]?.dataUrl).toBe(
      'https://demotiles.maplibre.org/tiles/tiles.json',
    );
  });

  it('tileJsonToCreateControlPatch resolves tiles and source layers', () => {
    const patch = tileJsonToCreateControlPatch(
      DEMO_TILEJSON,
      'https://demotiles.maplibre.org/tiles/tiles.json',
      '',
    );
    expect(patch['tiles']).toEqual([
      'https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf',
    ]);
    expect(patch['tileKind']).toBe('vector');
    expect(patch['sourceLayers']).toEqual(['countries']);
    expect(patch['sourceLayerOptions']).toEqual([
      expect.objectContaining({
        id: 'countries',
        enabled: true,
        fields: { ADM0_A3: 'String', NAME: 'String' },
      }),
    ]);
    expect(patch['name']).toBe('MapLibre demotiles');
  });

  it('resolves relative tiles[] against the TileJSON URL', () => {
    const patch = tileJsonToCreateControlPatch(
      {
        ...DEMO_TILEJSON,
        tiles: ['{z}/{x}/{y}.pbf'],
      },
      'https://demotiles.maplibre.org/tiles/tiles.json',
      'My layer',
    );
    expect(patch['tiles']).toEqual([
      'https://demotiles.maplibre.org/tiles/{z}/{x}/{y}.pbf',
    ]);
    expect(patch['name']).toBe('My layer');
  });

  it('ConfigTilejsonHelper validates tiles and source layers', () => {
    const helper = new ConfigTilejsonHelper();
    expect(
      helper.validationErrors({
        name: 'Demo',
        tiles: [],
        url: '',
      }),
    ).toContain('validation-url');
    expect(
      helper.validationErrors({
        name: 'Demo',
        tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
        tileKind: 'vector',
        sourceLayerOptions: [
          { id: 'countries', enabled: false },
          { id: 'cities', enabled: false },
        ],
      }),
    ).toContain('validation-source-layers');
    expect(
      helper.validate({
        name: 'Demo',
        tiles: ['https://example.com/{z}/{x}/{y}.pbf'],
        tileKind: 'vector',
        sourceLayerOptions: [{ id: 'countries', enabled: true }],
      }),
    ).toBe(true);
  });
});
