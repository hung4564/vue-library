import { getUUIDv4 } from '@hungpvq/shared';
import type { MapSimple } from '@hungpvq/shared-map';
import { logHelper, mergeFilters } from '@hungpvq/shared-map';
import type { Feature } from 'geojson';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONFeature,
  GeoJSONSource,
  LayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl';
import { findFirstLeafByType } from '..';
import type { WithDataHelper } from '../../extra';
import type { IDataset } from '../../interfaces';
import { loggerHighlight } from '../../logger';

export type HighlightFilterCreator =
  | string
  | ((feature?: GeoJSONFeature | Feature) => any[] | undefined);

export function createHighlightFilter(
  feature: GeoJSONFeature | Feature | undefined,
  filterCreator?: HighlightFilterCreator,
): any[] | undefined {
  if (!feature) return undefined;

  if (!filterCreator) {
    // Default behavior: use id (feature.id or feature.properties.id)
    const field_id = feature?.id || (feature as any)?.properties?.id;
    return field_id ? ['==', 'id', field_id] : undefined;
  }

  if (typeof filterCreator === 'string') {
    // If it's a string, use it as property field name
    // Special case for 'id': use feature.id or feature.properties.id with ['==', 'id', value]
    if (filterCreator === 'id') {
      const field_id = feature?.id || (feature as any)?.properties?.id;
      return field_id ? ['==', 'id', field_id] : undefined;
    }
    // For other properties, use ['get', propertyName] syntax
    const fieldValue = (feature as any)?.properties?.[filterCreator];
    if (fieldValue == null) return undefined;
    return ['==', filterCreator, fieldValue];
  }

  if (typeof filterCreator === 'function') {
    // If it's a function, call it with the feature
    return filterCreator(feature);
  }

  return undefined;
}

type LayerKey = 'point' | 'line' | 'polygon';
// highlightLayers.ts
export function createDefaultHighlightLayers(color: string) {
  return {
    point: {
      type: 'circle',
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': 6,
        'circle-color': color,
        'circle-opacity': 0.7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    },
    line: {
      type: 'line',
      filter: ['==', '$type', 'LineString'],
      paint: {
        'line-color': color,
        'line-width': 4,
        'line-dasharray': [2, 4],
      },
    },
    polygon: {
      type: 'fill',
      filter: ['==', '$type', 'Polygon'],
      paint: {
        'fill-color': color,
        'fill-opacity': 0.4,
      },
    },
  } as Record<
    LayerKey,
    Partial<
      FillLayerSpecification | LineLayerSpecification | CircleLayerSpecification
    >
  >;
}
// highlightSource.ts
export function ensureHighlightSource(
  base: (IDataset & WithDataHelper) | undefined,
  map: MapSimple,
  feature?: GeoJSONFeature,
): string {
  if (base) {
    const sourceLeaf = findFirstLeafByType(base, 'source');
    if (sourceLeaf) {
      const sourceId = (sourceLeaf as any).getSourceId();
      logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
        'highlight',
        'use source dataset',
        { dataset: base, source: sourceLeaf, sourceId, feature },
      );
      return sourceId;
    }
  }

  const sourceId = (base?.id || getUUIDv4()) + '-source-highlighted';
  const data = feature ?? { type: 'FeatureCollection', features: [] };
  logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
    'highlight',
    'use source geojson',
    { dataset: base, sourceId, feature, data },
  );
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, { type: 'geojson', data });
  } else {
    (map.getSource(sourceId) as GeoJSONSource).setData(data);
  }
  return sourceId;
}
// highlightLayers.ts
export function ensureHighlightLayers(
  map: MapSimple,
  layerIds: Record<string, string>,
  layersDefault: Record<string, Partial<LayerSpecification>>,
  dataset: WithDataHelper | undefined,
  sourceId: string,
  feature?: GeoJSONFeature,
  filterCreator?: HighlightFilterCreator,
) {
  (Object.keys(layerIds) as (keyof typeof layerIds)[]).forEach((key) => {
    const id = layerIds[key];
    const baseLayer = layersDefault[key];
    const highlightFilter = createHighlightFilter(feature, filterCreator);
    const mergedFilter = mergeFilters([
      (baseLayer as any).filter,
      dataset?.getData()?.filter || highlightFilter || {},
    ]);
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
    const temp = {
      id,
      source: sourceId,
      ...baseLayer,
      ...dataset?.getData(),
      filter: mergedFilter,
    } as LayerSpecification;
    logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
      'highlight',
      'layer',
      { layer: temp, filter: mergedFilter, feature, highlightFilter },
    );
    map.addLayer(temp);
  });
}

export type HighlightAnimState = {
  frameId: number | null;
  timeoutId: any;
  [key: string]: any;
};
export function defaultAnimate(props: {
  map: MapSimple;
  layerIds: Record<string, string>;
  state: HighlightAnimState;
}) {
  const { map, layerIds, state } = props;
  // giả sử state có radius/grow/dashOffset/blinkAlpha... thì animate được
  let { radius = 6, grow = true, dashOffset = 0 } = state;

  radius += grow ? 0.2 : -0.2;
  if (radius >= 12) grow = false;
  if (radius <= 6) grow = true;
  map.setPaintProperty(layerIds.point, 'circle-radius', radius);

  dashOffset += 0.1;
  dashOffset = +dashOffset.toFixed(1);
  if (dashOffset >= 6) dashOffset = 0;
  map.setPaintProperty(layerIds.line, 'line-dasharray', [
    2 + dashOffset,
    4 + dashOffset,
  ]);

  state.blinkAlpha = (state.blinkAlpha ?? 0.4) + (state.blinkDir ?? 1) * 0.05;
  if (state.blinkAlpha > 0.8) state.blinkDir = -1;
  if (state.blinkAlpha < 0.2) state.blinkDir = 1;
  map.setPaintProperty(layerIds.polygon, 'fill-opacity', state.blinkAlpha);

  // cập nhật lại state
  state.radius = radius;
  state.grow = grow;
  state.dashOffset = dashOffset;
}
export function useHighlightAnimation<T = any>() {
  const animStates: Record<string, HighlightAnimState & T> = {};
  // biến lưu callback cho từng id map
  const callbacks: Record<
    string,
    {
      onStart?: () => void;
      onDone?: () => void;
      onCancel?: () => void;
    }
  > = {};
  function startAnimation(
    map: MapSimple,
    layerIds: Record<string, string>,
    durationMs = 5000,
    animateFn: (props: {
      map: MapSimple;
      layerIds: Record<string, string>;
      state: HighlightAnimState & T;
    }) => void = defaultAnimate,
    initialState: Record<string, any> = {},
  ) {
    Object.values(layerIds).forEach((id) => {
      if (map.getLayer(id)) {
        map.moveLayer(id);
      }
    });
    const id = (map as any).id || 'default';

    callbacks[id]?.onStart?.();

    animStates[id] = {
      frameId: null,
      timeoutId: null,
      ...initialState, // bạn tự thêm radius, dashOffset, ...
    } as HighlightAnimState & T;

    function loop() {
      const state = animStates[id];
      if (!state) return;
      animateFn({ map, layerIds, state });
      state.frameId = requestAnimationFrame(loop);
    }

    loop();

    if (durationMs > 0) {
      animStates[id].timeoutId = setTimeout(() => {
        stopAnimation(map, layerIds, false);
        callbacks[id]?.onDone?.();
      }, durationMs);
    }
  }

  function stopAnimation(
    map: MapSimple,
    layerIds: Record<string, string>,
    cancelled = true,
  ) {
    const id = (map as any).id || 'default';
    const state = animStates[id];
    if (!state) return;
    if (state.frameId) cancelAnimationFrame(state.frameId);
    if (state.timeoutId) clearTimeout(state.timeoutId);
    delete animStates[id];
    if (cancelled) callbacks[id]?.onCancel?.();
    (Object.keys(layerIds) as (keyof typeof layerIds)[]).forEach((key) => {
      const layerId = layerIds[key];
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    });
  }
  function initAnimation({
    layerIds,
    dataset,
    map,
    feature,
    layers,
    filterCreator,
  }: {
    dataset?: IDataset & WithDataHelper;
    map: MapSimple;
    feature?: GeoJSONFeature;
    layerIds: Record<string, string>;
    layers: Record<string, Partial<LayerSpecification>>;
    filterCreator?: HighlightFilterCreator;
  }) {
    const sourceId = ensureHighlightSource(dataset, map, feature);
    ensureHighlightLayers(
      map,
      layerIds,
      layers,
      dataset,
      sourceId,
      feature,
      filterCreator,
    );
  }
  function setOnDone(map: MapSimple, cb: () => void) {
    const id = (map as any).id || 'default';
    callbacks[id] = callbacks[id] || {};
    callbacks[id].onDone = cb;
  }

  function setOnStart(map: MapSimple, cb: () => void) {
    const id = (map as any).id || 'default';
    callbacks[id] = callbacks[id] || {};
    callbacks[id].onStart = cb;
  }

  function setOnCancel(map: MapSimple, cb: () => void) {
    const id = (map as any).id || 'default';
    callbacks[id] = callbacks[id] || {};
    callbacks[id].onCancel = cb;
  }

  return {
    startAnimation,
    stopAnimation,
    defaultAnimate,
    initAnimation,
    setOnDone,
    setOnStart,
    setOnCancel,
  };
}
