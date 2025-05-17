import { LayerSpecification } from 'maplibre-gl';

export type LegendLayerSpecification = LayerSpecification & {
  metadata: {
    'maplibregl-legend:disable': boolean | string;
    'maplibregl-legend:name'?: string;
  };
};

export function isDisabledLegendLayer(layer: LegendLayerSpecification) {
  const value = layer?.metadata?.['maplibregl-legend:disable'];
  return value === true || value === 'true' || value === '1';
}

export function getLegendName(layer: LegendLayerSpecification) {
  const value = layer?.metadata?.['maplibregl-legend:name'];
  return value || layer.id;
}

export function isSupportGenLayerLegend(
  layer: LayerSpecification
): layer is LegendLayerSpecification {
  return (
    ['circle', 'fill', 'line', 'symbol'].includes(layer.type) &&
    !isDisabledLegendLayer(layer as LegendLayerSpecification)
  );
}
