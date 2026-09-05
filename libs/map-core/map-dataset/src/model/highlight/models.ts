import { type MapSimple } from '@hungpvq/map-core';
import type { GeoJSONFeature, LayerSpecification } from 'maplibre-gl';
import { createWithDataHelper } from '../../extra';
import { createNamedComponent } from '../base';
import { createDatasetLeaf } from '../dataset.base.function';
import {
  applyHighlightFeatureState,
  clearHighlightFeatureState,
  createDefaultHighlightLayerIds,
  createFeatureStateHighlightLayers,
  createShadowHighlightLayers,
  DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY,
  featureStatePulseAnimate,
  setPaintIfLayer,
  type HighlightAnimState,
  type HighlightFilterCreator,
  type HighlightLayerIds,
  useHighlightAnimation,
} from './helper';
import type { IHighlightView } from './types';

export type { HighlightFilterCreator };

export function createDatasetPartHighlightComponent(
  data?: Partial<LayerSpecification>,
  options?: {
    filterCreator?: HighlightFilterCreator;
  },
): IHighlightView {
  const base = createDatasetLeaf('');
  const dataHelper = createWithDataHelper(data);
  const filterCreator = options?.filterCreator;

  return createNamedComponent('HighlightComponent', {
    ...base,
    ...dataHelper,
    get type() {
      return 'highlight';
    },
    getFilterCreator() {
      return filterCreator;
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
    layerIds: HighlightLayerIds;
    state: { startTime: number };
  }) {
    const t = (performance.now() - state.startTime) / 1000; // giây
    const hue = (t * 60) % 360;
    const c = `hsl(${hue}, 80%, 50%)`;
    const opacity = 0.4 + 0.3 * Math.sin(t * 2);

    setPaintIfLayer(map, layerIds.point, 'circle-stroke-color', c);
    const radius = 6 + Math.sin(t * 3) * 2;
    setPaintIfLayer(map, layerIds.point, 'circle-radius', radius);
    setPaintIfLayer(map, layerIds.point, 'circle-opacity', opacity);

    setPaintIfLayer(map, layerIds.line, 'line-color', c);
    setPaintIfLayer(map, layerIds.line, 'line-opacity', opacity);

    setPaintIfLayer(map, layerIds.polygon, 'fill-color', c);
    setPaintIfLayer(map, layerIds.polygon, 'fill-opacity', opacity);
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

export function createDatasetPartShadowHighlightComponent(
  color = '#FFB703',
  data?: Partial<LayerSpecification>,
  options?: {
    filterCreator?: HighlightFilterCreator;
  },
): IHighlightView {
  return createDatasetPartCustomAnimateHighlightComponent(
    null,
    () => ({}),
    data,
    {
      ...options,
      layerIds: (id) => createDefaultHighlightLayerIds(`${id}-shadow`),
      layers: createShadowHighlightLayers(color),
    },
  );
}

export function createDatasetPartFeatureStateHighlightComponent(
  color = '#E63946',
  data?: Partial<LayerSpecification>,
  options?: {
    filterCreator?: HighlightFilterCreator;
    stateKey?: string;
  },
): IHighlightView {
  const stateKey = options?.stateKey ?? DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY;
  const base = createDatasetLeaf('');
  const dataHelper = createWithDataHelper(data);
  const {
    startAnimation: _startAnimation,
    stopAnimation: _stopAnimation,
    initAnimation,
    setOnDone: _setOnDone,
  } = useHighlightAnimation<{ startTime: number; stateKey: string }>();
  const layerIds = createDefaultHighlightLayerIds(`${base.id}-feature-state`);
  const layers = createFeatureStateHighlightLayers(color, stateKey);
  let applied:
    | { sourceId: string; ids: Array<string | number> }
    | undefined;

  function clearApplied(map: MapSimple) {
    if (!applied) return;
    clearHighlightFeatureState(map, applied.sourceId, applied.ids, stateKey);
    applied = undefined;
  }

  function startAnimation({
    map,
    feature,
    durationMs = 5000,
  }: {
    map: MapSimple;
    feature?: GeoJSONFeature;
    durationMs?: number;
  }) {
    clearApplied(map);
    const { sourceId } = initAnimation({
      map,
      layerIds,
      layers,
      dataset: {
        ...base,
        ...dataHelper,
        get type() {
          return 'highlight';
        },
      },
      feature,
      filterCreator: options?.filterCreator,
      skipHighlightFilter: true,
    });
    applied = {
      sourceId,
      ids: applyHighlightFeatureState(map, sourceId, feature, {
        filterCreator: options?.filterCreator,
        stateKey,
      }),
    };
    _startAnimation(map, layerIds, durationMs, featureStatePulseAnimate, {
      startTime: performance.now(),
      stateKey,
    });
  }

  function stopAnimation(map: MapSimple) {
    clearApplied(map);
    _stopAnimation(map, layerIds);
  }

  function setOnDone(map: MapSimple, cb: () => void) {
    _setOnDone(map, () => {
      clearApplied(map);
      cb();
    });
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
    getFilterCreator() {
      return options?.filterCreator;
    },
  });
}

export function createDatasetPartCustomAnimateHighlightComponent<T>(
  animateFn:
    | ((ctx: {
        map: MapSimple;
        layerIds: HighlightLayerIds;
        state: HighlightAnimState & T;
      }) => void)
    | null,
  createDefaultState: () => Partial<HighlightAnimState & T>,
  data?: Partial<LayerSpecification>,
  options?: {
    filterCreator?: HighlightFilterCreator;
    layers?: Record<string, Partial<LayerSpecification>>;
    layerIds?: HighlightLayerIds | ((id: string) => HighlightLayerIds);
  },
): IHighlightView {
  const base = createDatasetLeaf('');
  const dataHelper = createWithDataHelper(data);

  const {
    startAnimation: _startAnimation,
    stopAnimation: _stopAnimation,
    initAnimation,
    setOnDone,
  } = useHighlightAnimation<T>();
  const layerIds: HighlightLayerIds =
    typeof options?.layerIds === 'function'
      ? options.layerIds(base.id)
      : options?.layerIds ?? {
          point: base.id + '-layer-highlighted-point',
          line: base.id + '-layer-highlighted-line',
          polygon: base.id + '-layer-highlighted-polygon',
        };

  const layersDefault: Record<string, Partial<LayerSpecification>> =
    options?.layers ?? {
      point: {
        type: 'circle',
        filter: ['==', ['geometry-type'], 'Point'],
        paint: {
          'circle-radius': 6,
          'circle-color': '#880808',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      },
      line: {
        type: 'line',
        filter: ['==', ['geometry-type'], 'LineString'],
        paint: {
          'line-color': '#880808',
          'line-width': 4,
        },
      },
      polygon: {
        type: 'fill',
        filter: ['==', ['geometry-type'], 'Polygon'],
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
      filterCreator: options?.filterCreator,
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
