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

  it('does not throw when getImage fails because style is missing', () => {
    const map = {
      getZoom: () => 10,
      getImage: () => {
        throw new TypeError(
          "Cannot read properties of undefined (reading 'getImage')",
        );
      },
    } as any;
    const layer = {
      id: 'poi',
      type: 'symbol',
      layout: { 'icon-image': 'marker' },
    } as any;

    expect(() => buildLayerLegendElements(map, layer)).not.toThrow();
    const tree = buildLayerLegendElements(map, layer);
    expect(tree.element).toBe('div');
  });
});
