import type { MapSimple } from '@hungpvq/shared-map';
import {
  createDatasetPartCustomAnimateHighlightComponent,
  type HighlightFilterCreator,
  type IHighlightView,
} from '@hungpvq/vue-map-dataset';
import type { LayerSpecification } from 'maplibre-gl';

export function createDatasetCustomHighlightComponent(
  data?: Partial<LayerSpecification>,
  options?: {
    filterCreator?: HighlightFilterCreator;
  },
): IHighlightView {
  function animateFn({
    layerIds,
    map,
    state,
  }: {
    map: MapSimple;
    layerIds: Record<string, string>;
    state: { color: string; startTime: number };
  }) {
    const t = (performance.now() - state.startTime) / 1000; // giây
    const c = state.color;
    const radius = 6 + Math.sin(t * 3) * 2;
    const opacity = 0.4 + 0.3 * Math.sin(t * 2);
    map.setPaintProperty(layerIds.point, 'circle-stroke-color', c);
    map.setPaintProperty(layerIds.point, 'circle-radius', radius);

    map.setPaintProperty(layerIds.line, 'line-color', c);
    map.setPaintProperty(layerIds.line, 'line-width', radius);

    map.setPaintProperty(layerIds.polygon, 'fill-color', c);
    map.setPaintProperty(layerIds.polygon, 'fill-opacity', opacity);
  }

  return createDatasetPartCustomAnimateHighlightComponent<{
    color: string;
    startTime: number;
  }>(
    animateFn,
    () => ({
      color: '#880808',
      startTime: performance.now(),
    }),
    data,
    options,
  );
}
