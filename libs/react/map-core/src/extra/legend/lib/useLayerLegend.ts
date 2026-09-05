import {
  createElement,
  useCallback,
  type CSSProperties,
  type ReactNode,
} from 'react';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  Map,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import {
  MapLegend,
  type LegendElement,
  type LegendLayerSpecification,
} from '@hungpvq/map-core';

const FALLBACK_ICON_PATHS = [
  'M21,0H3A3,3,0,0,0,0,3V21a3,3,0,0,0,3,3H21a3,3,0,0,0,3-3V3A3,3,0,0,0,21,0ZM3,2H21a1,1,0,0,1,1,1V15.86L14.18,9.35a5.06,5.06,0,0,0-6.39-.06L2,13.92V3A1,1,0,0,1,3,2ZM21,22H3a1,1,0,0,1-1-1V16.48l7-5.63a3.06,3.06,0,0,1,3.86,0L22,18.47V21A1,1,0,0,1,21,22Z',
  'M18,9a3,3,0,1,0-3-3A3,3,0,0,0,18,9Zm0-4a1,1,0,1,1-1,1A1,1,0,0,1,18,5Z',
];

export function useLayerLegend() {
  const getLayerLegendNode = useCallback((
    map: Map,
    layer: LegendLayerSpecification,
  ): ReactNode => {
    const zoom = map?.getZoom();
    const symbol = MapLegend({
      map,
      zoom,
      layer: layer as
        | FillLayerSpecification
        | LineLayerSpecification
        | SymbolLayerSpecification
        | CircleLayerSpecification,
    });

    let symbolContent: ReactNode;
    if (!symbol) {
      symbolContent = createElement(
        'svg',
        {
          fill: 'none',
          viewBox: '0 0 24 24',
          stroke: 'black',
          className: 'post-icon',
        },
        ...FALLBACK_ICON_PATHS.map((d, index) =>
          createElement('path', {
            key: index,
            d,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: '2',
          }),
        ),
      );
    } else if (symbol.element === 'svg') {
      symbol.attributes.style = { height: '17px' };
      symbol.attributes.version = '1.1';
      symbolContent = renderElement(symbol);
    } else if (symbol.element === 'div') {
      symbolContent = renderElement(symbol);
    } else {
      symbolContent = createElement('div');
    }

    const legendItemStyle: CSSProperties =
      symbol?.element === 'div' &&
      symbol.attributes.style &&
      typeof symbol.attributes.style === 'object'
        ? {
            backgroundColor: symbol.attributes.style.backgroundColor,
            backgroundPosition: symbol.attributes.style.backgroundPosition,
            backgroundSize: symbol.attributes.style.backgroundSize,
            backgroundRepeat: symbol.attributes.style.backgroundRepeat,
            opacity: symbol.attributes.style.opacity,
          }
        : {};

    return createElement(
      'div',
      { className: 'legend-item-container' },
      createElement(
        'div',
        { className: 'legend-item', style: legendItemStyle },
        symbolContent,
      ),
    );
  }, []);
  return { getLayerLegendNode };
}

/** MapLibre legend builders emit Vue-style SVG attrs; React needs camelCase. */
const REACT_ATTR_MAP: Record<string, string> = {
  class: 'className',
  'xlink:href': 'href',
  'stroke-width': 'strokeWidth',
  'stroke-opacity': 'strokeOpacity',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-linecap': 'strokeLinecap',
  'fill-opacity': 'fillOpacity',
  'clip-path': 'clipPath',
};

function cssTextToStyleObject(cssText: string): Record<string, string> {
  const style: Record<string, string> = {};
  for (const declaration of cssText.split(';')) {
    const trimmed = declaration.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(':');
    if (colon === -1) continue;
    const prop = trimmed.slice(0, colon).trim();
    const value = trimmed.slice(colon + 1).trim();
    if (!prop || !value) continue;
    const camel = prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    style[camel] = value;
  }
  return style;
}

function toReactAttributes(
  attributes: Record<string, unknown> = {},
): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(attributes)) {
    const reactKey = REACT_ATTR_MAP[key] ?? key;
    if (reactKey === 'style' && typeof value === 'string') {
      next.style = cssTextToStyleObject(value);
    } else {
      next[reactKey] = value;
    }
  }
  return next;
}

function renderElement(element: LegendElement): ReactNode {
  const children = element.children?.map(renderElement) || [];
  return createElement(
    element.element,
    toReactAttributes(element.attributes),
    ...children,
  );
}
