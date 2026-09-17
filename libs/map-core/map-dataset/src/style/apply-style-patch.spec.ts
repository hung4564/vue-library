import { describe, expect, it } from 'vitest';
import type { LayerSpecification } from 'maplibre-gl';
import { applyStyleTabValue, applyStyleZoom } from './apply-style-patch';
import type { Tab } from './type';

describe('applyStyleTabValue / applyStyleZoom', () => {
  const base = {
    id: 'l1',
    type: 'fill',
    paint: { 'fill-color': '#fff', 'fill-opacity': 1 },
  } as LayerSpecification;

  it('patches paint immutably', () => {
    const tab = {
      type: 'color',
      key: 'fill-color',
      part: 'paint',
    } as Tab;
    const next = applyStyleTabValue(base, tab, '#000');
    expect(next).not.toBe(base);
    expect(next.paint?.['fill-color']).toBe('#000');
    expect(base.paint?.['fill-color']).toBe('#fff');
  });

  it('applies tab.format before write', () => {
    const tab = {
      type: 'opacity',
      key: 'fill-opacity',
      part: 'paint',
      format: (v: unknown) => Number(v) / 100,
    } as Tab;
    const next = applyStyleTabValue(base, tab, 50);
    expect(next.paint?.['fill-opacity']).toBe(0.5);
  });

  it('applyStyleZoom sets min/max zoom', () => {
    const withMin = applyStyleZoom(base, 'min-zoom', 3);
    expect((withMin as { 'min-zoom'?: number })['min-zoom']).toBe(3);
    const withMax = applyStyleZoom(base, 'max-zoom', 18);
    expect((withMax as { 'max-zoom'?: number })['max-zoom']).toBe(18);
  });
});
