import { MapSimple } from '@hungpvq/map-core';
import { StyleSpecification } from 'maplibre-gl';

export type InspectStyleSpecification = StyleSpecification & {
  metadata: { 'maplibregl-inspect:inspect': boolean };
};

export function isInspectStyle(style: InspectStyleSpecification) {
  return style.metadata && style.metadata['maplibregl-inspect:inspect'];
}

/**
 * Snapshot a MapLibre style for restore. Prefer JSON over structuredClone:
 * `map.getStyle()` can include non-cloneable values (DataCloneError).
 */
export function cloneStyleSpecification(
  style: StyleSpecification,
): StyleSpecification {
  return JSON.parse(JSON.stringify(style)) as StyleSpecification;
}

function collectSourceLayersFromStyle(
  style: StyleSpecification,
  sourceId: string,
): string[] {
  const layerIds: string[] = [];
  for (const layer of style.layers) {
    if (
      'source' in layer &&
      layer.source === sourceId &&
      'source-layer' in layer &&
      layer['source-layer']
    ) {
      layerIds.push(layer['source-layer']);
    }
  }
  return [...new Set(layerIds)];
}

/**
 * Build a source → vector-layer-id map from the current map style.
 * Matches maplibre-gl-inspect: geojson → []; vector → TileJSON `vector_layers`,
 * with style `source-layer` fallback (no private `sourceCaches` API).
 */
export async function getSourcesFromMap(
  map: MapSimple,
): Promise<Record<string, string[]>> {
  const style = map.getStyle();
  const sources: Record<string, string[]> = {};
  if (!style?.sources) {
    return sources;
  }

  const mapStyleSourcesNames = Object.keys(style.sources);
  for (const sourceId of mapStyleSourcesNames) {
    const source = style.sources[sourceId];
    if (source.type === 'geojson') {
      sources[sourceId] = [];
    } else if (source.type === 'vector') {
      const url = 'url' in source ? source.url : undefined;
      if (url) {
        try {
          const response = await fetch(url);
          const tileJSON = await response.json();
          const vectorLayerIds = tileJSON?.vector_layers?.map(
            (layer: { id: string }) => layer.id,
          );
          if (vectorLayerIds?.length) {
            sources[sourceId] = vectorLayerIds;
          } else {
            throw new Error('Missing vector_layers in source: ' + sourceId);
          }
        } catch {
          console.warn(
            'Unable to retrieve tileJSON from ' +
              url +
              " using style's layers",
          );
          sources[sourceId] = collectSourceLayersFromStyle(style, sourceId);
        }
      } else {
        sources[sourceId] = collectSourceLayersFromStyle(style, sourceId);
      }
    }
  }

  return sources;
}

export function markInspectStyle(style: StyleSpecification) {
  return Object.assign(style, {
    metadata: Object.assign({}, style.metadata, {
      'maplibregl-inspect:inspect': true,
    }),
  });
}
