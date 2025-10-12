import { type MapSimple } from '@hungpvq/shared-map';
import type { GeoJSONFeature, LayerSpecification } from 'maplibre-gl';
import { createWithDataHelper } from '../../extra';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import { findFirstLeafByType } from '../visitors';
import { type HighlightAnimState, useHighlightAnimation } from './helper';
import type { IHighlightView } from './types';
export function createDatasetPartHighlightComponent(
  data?: Partial<LayerSpecification>,
): IHighlightView {
  const base = createDatasetLeaf('');
  const dataHelper = createWithDataHelper(data);

  return createNamedComponent('HighlightComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'highlight';
    },
    highlight: (feature) => {
      const source = findFirstLeafByType(base, 'source');
      const source_id = (source as any)?.getSourceId();
      const field_id = feature?.id || feature?.properties.id;
      if (!field_id) {
        return undefined;
      }
      return {
        source: source_id,
        filter: field_id ? ['==', 'id', field_id] : undefined,
        ...dataHelper.getData(),
      };
    },
  });
}
export function createDatasetPartChangeColorHighlightComponent(
  data?: Partial<LayerSpecification>,
): IHighlightView {
  function animateFn({
    layerIds,
    state,
    map,
  }: {
    map: MapSimple;
    layerIds: Record<string, string>;
    state: { startTime: number };
  }) {
    const t = (performance.now() - state.startTime) / 1000; // giây
    const hue = (t * 60) % 360;
    const c = `hsl(${hue}, 80%, 50%)`;
    const opacity = 0.4 + 0.3 * Math.sin(t * 2);

    map.setPaintProperty(layerIds.point, 'circle-stroke-color', c);
    const radius = 6 + Math.sin(t * 3) * 2;
    map.setPaintProperty(layerIds.point, 'circle-radius', radius);
    map.setPaintProperty(layerIds.point, 'circle-opacity', opacity);

    map.setPaintProperty(layerIds.line, 'line-color', c);
    map.setPaintProperty(layerIds.line, 'line-opacity', opacity);

    map.setPaintProperty(layerIds.polygon, 'fill-color', c);
    map.setPaintProperty(layerIds.polygon, 'fill-opacity', opacity);
  }

  return createDatasetPartCustomAnimateHighlightComponent<{
    startTime: number;
  }>(
    animateFn,
    () => ({
      startTime: performance.now(),
    }),
    data,
  );
}

export function createDatasetPartCustomAnimateHighlightComponent<T>(
  animateFn: (ctx: {
    map: MapSimple;
    layerIds: Record<string, string>;
    state: HighlightAnimState & T;
  }) => void,
  createDefaultState: () => Partial<HighlightAnimState & T>,
  data?: Partial<LayerSpecification>,
): IHighlightView {
  const base = createDatasetLeaf('');
  const dataHelper = createWithDataHelper(data);

  const {
    startAnimation: _startAnimation,
    stopAnimation: _stopAnimation,
    initAnimation,
    setOnDone,
  } = useHighlightAnimation<T>();
  const layerIds = {
    point: base.id + '-layer-highlighted-point',
    line: base.id + '-layer-highlighted-line',
    polygon: base.id + '-layer-highlighted-polygon',
  };

  const layersDefault: Record<string, Partial<LayerSpecification>> = {
    point: {
      type: 'circle',
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 6,
        'circle-color': '#880808',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    },
    line: {
      type: 'line',
      filter: ['==', '$type', 'LineString'],
      paint: {
        'line-color': '#880808',
        'line-width': 4,
      },
    },
    polygon: {
      type: 'fill',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': '#880808',
      },
    },
  };

  function startAnimation({
    map,
    feature,
    durationMs = 5000, // destructuring default value
  }: {
    map: MapSimple;
    feature?: GeoJSONFeature;
    durationMs?: number;
  }) {
    initAnimation({
      map,
      layerIds: layerIds,
      layers: layersDefault,
      dataset: {
        ...base,
        ...dataHelper,
        get type() {
          return 'highlight';
        },
      },
      feature,
    });
    _startAnimation(map, layerIds, durationMs, animateFn, createDefaultState());
  }

  function stopAnimation(map: MapSimple) {
    _stopAnimation(map, layerIds);
  }
  return createNamedComponent('HighlightComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'highlight';
    },
    startAnimation,
    stopAnimation,
    setOnDone,
  });
}
