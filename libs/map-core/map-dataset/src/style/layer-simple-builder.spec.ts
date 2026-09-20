import { describe, expect, it } from 'vitest';
import { buildSimpleStyleLayers } from './layer-simple-builder';

describe('buildSimpleStyleLayers', () => {
  it('expands area into fill + outline line', () => {
    const layers = buildSimpleStyleLayers('area', '#0E9F6E', 0.5, {
      withTypeFilter: true,
      sourceLayer: 'countries',
    });
    expect(layers).toHaveLength(2);
    expect(layers[0].type).toBe('fill');
    expect(layers[1].type).toBe('line');
    expect(layers[0]['source-layer']).toBe('countries');
    expect(layers[1]['source-layer']).toBe('countries');
  });

  it('keeps point as a single circle layer', () => {
    const layers = buildSimpleStyleLayers('point', '#fff', 1);
    expect(layers).toHaveLength(1);
    expect(layers[0].type).toBe('circle');
  });
});
