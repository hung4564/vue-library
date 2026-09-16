import { describe, expect, it } from 'vitest';
import {
  buildLayerLegendElements,
  LAYER_LEGEND_FALLBACK_PATHS,
} from './buildLayerLegendElements';

describe('buildLayerLegendElements', () => {
  it('exports fallback path strings', () => {
    expect(LAYER_LEGEND_FALLBACK_PATHS).toHaveLength(2);
  });

  it('builds a container tree with fallback when MapLegend is null', () => {
    const map = { getZoom: () => 10, getImage: () => undefined } as any;
    // heatmap is unsupported by MapLegend → null → fallback SVG
    const layer = {
      id: 'unknown',
      type: 'heatmap',
    } as any;

    const tree = buildLayerLegendElements(map, layer);
    expect(tree.element).toBe('div');
    expect(tree.attributes.class).toBe('legend-item-container');
    const item = tree.children?.[0];
    expect(item?.attributes.class).toBe('legend-item');
    const content = item?.children?.[0];
    expect(content?.element).toBe('svg');
    expect(content?.attributes.class).toBe('post-icon');
    expect(content?.children).toHaveLength(2);
  });

  it('wraps a real line legend in the same container shape', () => {
    const map = { getZoom: () => 10, getImage: () => undefined } as any;
    const layer = {
      id: 'roads',
      type: 'line',
      paint: { 'line-color': '#ff0000', 'line-width': 2 },
    } as any;

    const tree = buildLayerLegendElements(map, layer);
    expect(tree.attributes.class).toBe('legend-item-container');
    const content = tree.children?.[0]?.children?.[0];
    expect(content?.element).toBe('svg');
    expect(content?.attributes.style).toBe('height: 17px;');
    expect(content?.attributes.version).toBe('1.1');
  });
});
