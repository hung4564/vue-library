import { describe, expect, it } from 'vitest';

import {
  LAYER_TYPES,
  type LayerType,
  resolveCreateControlLayerTypes,
} from './form-create';

describe('resolveCreateControlLayerTypes', () => {
  it('returns all types when allowed is undefined', () => {
    expect(resolveCreateControlLayerTypes()).toEqual(Object.keys(LAYER_TYPES));
  });

  it('filters and preserves caller order', () => {
    const allowed: LayerType[] = ['pmtiles', 'geojson', 'xyz'];
    expect(resolveCreateControlLayerTypes(allowed)).toEqual([
      'pmtiles',
      'geojson',
      'xyz',
    ]);
  });

  it('drops unknown keys and supports empty allowlist', () => {
    expect(
      resolveCreateControlLayerTypes(['geojson', 'nope' as LayerType]),
    ).toEqual(['geojson']);
    expect(resolveCreateControlLayerTypes([])).toEqual([]);
  });
});
