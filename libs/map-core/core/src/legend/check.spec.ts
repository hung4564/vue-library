import { describe, expect, it } from 'vitest';
import {
  getLegendName,
  isDisabledLegendLayer,
  isSupportGenLayerLegend,
} from './check';

describe('legend check', () => {
  it('detects disabled metadata variants', () => {
    expect(
      isDisabledLegendLayer({
        id: 'a',
        type: 'fill',
        metadata: { 'maplibregl-legend:disable': true },
      } as any),
    ).toBe(true);
    expect(
      isDisabledLegendLayer({
        id: 'a',
        type: 'fill',
        metadata: { 'maplibregl-legend:disable': '1' },
      } as any),
    ).toBe(true);
    expect(isDisabledLegendLayer({ id: 'a', type: 'fill' } as any)).toBe(
      false,
    );
  });

  it('getLegendName prefers metadata name', () => {
    expect(
      getLegendName({
        id: 'layer-1',
        type: 'fill',
        metadata: { 'maplibregl-legend:name': 'Named' },
      } as any),
    ).toBe('Named');
    expect(getLegendName({ id: 'layer-1', type: 'fill' } as any)).toBe(
      'layer-1',
    );
  });

  it('isSupportGenLayerLegend allows supported types when not disabled', () => {
    expect(isSupportGenLayerLegend({ id: 'f', type: 'fill' } as any)).toBe(
      true,
    );
    expect(isSupportGenLayerLegend({ id: 'r', type: 'raster' } as any)).toBe(
      false,
    );
    expect(
      isSupportGenLayerLegend({
        id: 'f',
        type: 'fill',
        metadata: { 'maplibregl-legend:disable': true },
      } as any),
    ).toBe(false);
  });
});
