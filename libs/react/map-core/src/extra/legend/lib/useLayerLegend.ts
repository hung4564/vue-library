import {
  createElement,
  useCallback,
  type ReactNode,
} from 'react';
import type { LayerSpecification, Map } from 'maplibre-gl';
import {
  buildLayerLegendElements,
  type LegendElement,
} from '@hungpvq/map-core/legend';

export function useLayerLegend() {
  const getLayerLegendNode = useCallback((
    map: Map,
    layer: LayerSpecification,
  ): ReactNode => {
    return renderElement(buildLayerLegendElements(map, layer));
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
