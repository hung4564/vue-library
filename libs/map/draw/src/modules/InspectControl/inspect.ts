import { MapSimple } from '@hungpvq/shared-map';
import { StyleSpecification } from 'maplibre-gl';

export type InspectStyleSpecification = StyleSpecification & {
  metadata: { 'maplibregl-inspect:inspect': boolean };
};

export function isInspectStyle(style: InspectStyleSpecification) {
  return style.metadata && style.metadata['maplibregl-inspect:inspect'];
}
export function getSourcesFromMap(map: MapSimple) {
  const sources: Record<string, string[]> = {};
  //NOTE: This heavily depends on the internal API of Maplibre GL
  //so this breaks between Maplibre GL JS releases
  Object.keys(map.style.sourceCaches).forEach((sourceId) => {
    const sourceCache = map.style.sourceCaches[sourceId] || {
      _source: {},
    };
    const layerIds = sourceCache._source.vectorLayerIds;
    if (layerIds) {
      sources[sourceId] = layerIds;
    } else if (sourceCache._source.type === 'geojson') {
      sources[sourceId] = [];
    }
  });
  return sources;
}

export function markInspectStyle(style: StyleSpecification) {
  return Object.assign(style, {
    metadata: Object.assign({}, style.metadata, {
      'maplibregl-inspect:inspect': true,
    }),
  });
}
