import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  Map,
  SymbolLayerSpecification,
} from 'maplibre-gl';
import type { VNode } from 'vue';
import { h } from 'vue';

import { LegendElement, MapLegend } from './MapLegend';

export function useLayerLegend() {
  function getLayerLegendVNode(
    map: Map,
    layer:
      | FillLayerSpecification
      | LineLayerSpecification
      | SymbolLayerSpecification
      | CircleLayerSpecification,
  ): VNode | undefined {
    const zoom = map?.getZoom();
    const symbol = MapLegend({ map, zoom, layer });
    const symbolContent = (() => {
      if (!symbol) {
        return [
          h(
            'svg',
            {
              fill: 'none',
              viewBox: '0 0 24 24',
              stroke: 'black',
              class: 'post-icon',
            },
            [
              h('path', {
                d: 'M21,0H3A3,3,0,0,0,0,3V21a3,3,0,0,0,3,3H21a3,3,0,0,0,3-3V3A3,3,0,0,0,21,0ZM3,2H21a1,1,0,0,1,1,1V15.86L14.18,9.35a5.06,5.06,0,0,0-6.39-.06L2,13.92V3A1,1,0,0,1,3,2ZM21,22H3a1,1,0,0,1-1-1V16.48l7-5.63a3.06,3.06,0,0,1,3.86,0L22,18.47V21A1,1,0,0,1,21,22Z',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
              }),
              h('path', {
                d: 'M18,9a3,3,0,1,0-3-3A3,3,0,0,0,18,9Zm0-4a1,1,0,1,1-1,1A1,1,0,0,1,18,5Z',
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
              }),
            ],
          ),
        ];
      }
      if (symbol.element === 'div') {
        return [renderElement(symbol)];
      }
      if (symbol.element === 'svg') {
        symbol.attributes['style'] = 'height: 17px;';
        symbol.attributes['version'] = '1.1';
        return [renderElement(symbol)];
      }
      return h('div');
    })();

    const td1 = h(
      'div',
      {
        class: 'legend-item',
        style:
          symbol?.element === 'div'
            ? {
                backgroundColor: symbol.attributes.style.backgroundColor,
                backgroundPosition: symbol.attributes.style.backgroundPosition,
                backgroundSize: symbol.attributes.style.backgroundSize,
                backgroundRepeat: symbol.attributes.style.backgroundRepeat,
                opacity: symbol.attributes.style.opacity,
              }
            : {},
      },
      symbolContent,
    );
    return h(
      'div',
      {
        class: 'legend-item-container',
      },
      [td1],
    );
  }

  return {
    getLayerLegendVNode,
  };
}
function renderElement(element: LegendElement): VNode {
  const children = element.children?.map(renderElement) || [];
  return h(element.element, { ...element.attributes }, children);
}
