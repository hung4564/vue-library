import type { LayerSpecification, Map } from 'maplibre-gl';
import type { VNode } from 'vue';
import { h } from 'vue';

import {
  buildLayerLegendElements,
  type LegendElement,
} from '@hungpvq/map-core/legend';

export function useLayerLegend() {
  function getLayerLegendVNode(
    map: Map,
    layer: LayerSpecification,
  ): VNode | undefined {
    return renderElement(buildLayerLegendElements(map, layer));
  }

  return {
    getLayerLegendVNode,
  };
}

function renderElement(element: LegendElement): VNode {
  const children = element.children?.map(renderElement) || [];
  return h(element.element, { ...element.attributes }, children);
}
