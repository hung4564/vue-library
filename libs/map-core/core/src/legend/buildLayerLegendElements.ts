import type { LayerSpecification, Map } from 'maplibre-gl';
import { MapLegend } from './MapLegend';
import type { LegendElement } from './types';

/** Layer types MapLegend can render (fill / line / symbol / circle). */
export type LayerLegendSource = Extract<
  LayerSpecification,
  { type: 'fill' | 'line' | 'symbol' | 'circle' }
>;

/** Fallback SVG path `d` values when MapLegend returns null. */
export const LAYER_LEGEND_FALLBACK_PATHS = [
  'M21,0H3A3,3,0,0,0,0,3V21a3,3,0,0,0,3,3H21a3,3,0,0,0,3-3V3A3,3,0,0,0,21,0ZM3,2H21a1,1,0,0,1,1,1V15.86L14.18,9.35a5.06,5.06,0,0,0-6.39-.06L2,13.92V3A1,1,0,0,1,3,2ZM21,22H3a1,1,0,0,1-1-1V16.48l7-5.63a3.06,3.06,0,0,1,3.86,0L22,18.47V21A1,1,0,0,1,21,22Z',
  'M18,9a3,3,0,1,0-3-3A3,3,0,0,0,18,9Zm0-4a1,1,0,1,1-1,1A1,1,0,0,1,18,5Z',
] as const;

function buildFallbackSymbolContent(): LegendElement {
  return {
    element: 'svg',
    attributes: {
      fill: 'none',
      viewBox: '0 0 24 24',
      stroke: 'black',
      class: 'post-icon',
    },
    children: LAYER_LEGEND_FALLBACK_PATHS.map((d) => ({
      element: 'path',
      attributes: {
        d,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': '2',
      },
    })),
  };
}

function legendItemStyleFromSymbol(
  symbol: LegendElement | null,
): Record<string, unknown> {
  if (
    symbol?.element !== 'div' ||
    !symbol.attributes.style ||
    typeof symbol.attributes.style !== 'object'
  ) {
    return {};
  }
  const style = symbol.attributes.style as Record<string, unknown>;
  return {
    backgroundColor: style.backgroundColor,
    backgroundPosition: style.backgroundPosition,
    backgroundSize: style.backgroundSize,
    backgroundRepeat: style.backgroundRepeat,
    opacity: style.opacity,
  };
}

function buildSymbolContent(
  symbol: LegendElement | null,
): LegendElement {
  if (!symbol) {
    return buildFallbackSymbolContent();
  }
  if (symbol.element === 'svg') {
    return {
      ...symbol,
      attributes: {
        ...symbol.attributes,
        style: 'height: 17px;',
        version: '1.1',
      },
      children: symbol.children ? [...symbol.children] : undefined,
    };
  }
  if (symbol.element === 'div') {
    return symbol;
  }
  return { element: 'div', attributes: {} };
}

/**
 * Build a framework-agnostic legend row tree for one MapLibre layer.
 * Adapters map `LegendElement` → VNode / ReactNode (attr mappers stay there).
 * Unsupported layer types yield the fallback SVG icon.
 */
export function buildLayerLegendElements(
  map: Map,
  layer: LayerSpecification,
): LegendElement {
  const zoom = map?.getZoom();
  const symbol = MapLegend({
    map,
    zoom,
    layer: layer as LayerLegendSource,
  });
  const content = buildSymbolContent(symbol);
  const itemStyle = legendItemStyleFromSymbol(symbol);

  return {
    element: 'div',
    attributes: { class: 'legend-item-container' },
    children: [
      {
        element: 'div',
        attributes: {
          class: 'legend-item',
          style: itemStyle,
        },
        children: [content],
      },
    ],
  };
}
