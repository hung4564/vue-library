import type { MapSimple } from '@hungpvq/map-core';
import {
  createHighlightPart,
  type HighlightFilterCreator,
  type HighlightLayerIds,
  type IHighlightPart,
} from '@hungpvq/map-dataset/highlight';

export function createDatasetCustomHighlightComponent(
  options?: {
    filterCreator?: HighlightFilterCreator;
  },
): IHighlightPart {
  function animate({
    layerIds,
    map,
    state,
  }: {
    map: MapSimple;
    layerIds: HighlightLayerIds;
    state: Record<string, unknown>;
  }) {
    const startTime = Number(state.startTime ?? performance.now());
    const color = String(state.color ?? '#880808');
    const t = (performance.now() - startTime) / 1000;
    const radius = 6 + Math.sin(t * 3) * 2;
    const opacity = 0.4 + 0.3 * Math.sin(t * 2);
    map.setPaintProperty(layerIds.point, 'circle-stroke-color', color);
    map.setPaintProperty(layerIds.point, 'circle-radius', radius);

    map.setPaintProperty(layerIds.line, 'line-color', color);
    map.setPaintProperty(layerIds.line, 'line-width', radius);

    map.setPaintProperty(layerIds.polygon, 'fill-color', color);
    map.setPaintProperty(layerIds.polygon, 'fill-opacity', opacity);
  }

  return createHighlightPart({
    mode: 'custom',
    animate,
    createDefaultState: () => ({
      color: '#880808',
      startTime: performance.now(),
    }),
    filterCreator: options?.filterCreator,
  });
}
