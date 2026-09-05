import type { MapSimple } from '@hungpvq/map-core';
import { logHelper, mergeFilters } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import type { Feature } from 'geojson';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  FilterSpecification,
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
  | ((
      feature?: GeoJSONFeature | Feature,
    ) => FilterSpecification | undefined);

function scalarProperty(
  feature: GeoJSONFeature | Feature | undefined,
  key: string,
): string | number | boolean | undefined {
  const value = feature?.properties?.[key];
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return undefined;
}

function featureIdValue(
  feature: GeoJSONFeature | Feature,
): string | number | undefined {
  const propId = scalarProperty(feature, 'id');
  if (typeof propId === 'string' || typeof propId === 'number') return propId;
  const id = feature.id;
  if (typeof id === 'string' || typeof id === 'number') return id;
  return undefined;
}

export function createHighlightFilter(
  feature: GeoJSONFeature | Feature | undefined,
  filterCreator?: HighlightFilterCreator,
): FilterSpecification | undefined {
  if (!feature) return undefined;

  if (!filterCreator) {
    const fieldId = featureIdValue(feature);
    return fieldId != null
      ? (['==', ['get', 'id'], fieldId] as FilterSpecification)
      : undefined;
  }

  if (typeof filterCreator === 'string') {
    if (filterCreator === 'id') {
      const fieldId = featureIdValue(feature);
      return fieldId != null
        ? (['==', ['get', 'id'], fieldId] as FilterSpecification)
        : undefined;
    }
    const fieldValue = scalarProperty(feature, filterCreator);
    if (fieldValue == null) return undefined;
    return ['==', ['get', filterCreator], fieldValue] as FilterSpecification;
  }

  if (typeof filterCreator === 'function') {
    return filterCreator(feature);
  }

  return undefined;
}

function toGeoJSONData(
  feature?: GeoJSONFeature | Feature,
): Feature | { type: 'FeatureCollection'; features: [] } {
  if (!feature) {
    return { type: 'FeatureCollection', features: [] };
  }
  const propertyId = scalarProperty(feature, 'id');
  const id =
    typeof feature.id === 'string' || typeof feature.id === 'number'
      ? feature.id
      : propertyId;
  return {
    type: 'Feature',
    id,
    properties: { ...(feature.properties || {}) },
    geometry: feature.geometry,
  };
}

export type HighlightLayerKey =
  'pointHalo' | 'lineHalo' | 'polygonHalo' | 'point' | 'line' | 'polygon';

export type HighlightLayerIds = {
  point: string;
  line: string;
  polygon: string;
  pointHalo?: string;
  lineHalo?: string;
  polygonHalo?: string;
  [key: string]: string | undefined;
};

export function createDefaultHighlightLayerIds(prefix = 'layer-highlighted') {
  return {
    pointHalo: `${prefix}-point-halo`,
    lineHalo: `${prefix}-line-halo`,
    polygonHalo: `${prefix}-polygon-halo`,
    point: `${prefix}-point`,
    line: `${prefix}-line`,
    polygon: `${prefix}-polygon`,
  } satisfies HighlightLayerIds;
}

const geometryTypeFilter = (type: 'Point' | 'LineString' | 'Polygon') =>
  ['==', ['geometry-type'], type] as FilterSpecification;

/** Convert legacy MapLibre filters (`$type`, `['==', 'id', v]`) to expressions. */
export function toExpressionFilter(
  filter: unknown,
): FilterSpecification | undefined {
  if (!filter || !Array.isArray(filter) || filter.length === 0) {
    return undefined;
  }
  const [op, ...args] = filter as unknown[];
  if (op === 'all' || op === 'any' || op === 'none') {
    const converted = args
      .map(toExpressionFilter)
      .filter((item): item is FilterSpecification => item != null);
    if (converted.length === 0) return undefined;
    if (converted.length === 1 && op === 'all') return converted[0];
    return [op, ...converted] as FilterSpecification;
  }
  if (typeof op === 'string' && typeof args[0] === 'string') {
    const key = args[0];
    const rest = args.slice(1);
    if (key === '$type') {
      return [op, ['geometry-type'], ...rest] as FilterSpecification;
    }
    if (key === '$id') {
      return [op, ['id'], ...rest] as FilterSpecification;
    }
    return [op, ['get', key], ...rest] as FilterSpecification;
  }
  return filter as FilterSpecification;
}

export function createDefaultHighlightLayers(color: string) {
  return {
    pointHalo: {
      type: 'circle',
      filter: geometryTypeFilter('Point'),
      paint: {
        'circle-radius': 18,
        'circle-color': color,
        'circle-opacity': 0.28,
        'circle-blur': 0.85,
      },
    },
    lineHalo: {
      type: 'line',
      filter: geometryTypeFilter('LineString'),
      paint: {
        'line-color': color,
        'line-width': 14,
        'line-opacity': 0.35,
        'line-blur': 6,
      },
    },
    polygonHalo: {
      type: 'line',
      filter: geometryTypeFilter('Polygon'),
      paint: {
        'line-color': color,
        'line-width': 10,
        'line-opacity': 0.45,
        'line-blur': 4,
      },
    },
    point: {
      type: 'circle',
      filter: geometryTypeFilter('Point'),
      paint: {
        'circle-radius': 6,
        'circle-color': color,
        'circle-opacity': 0.85,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    },
    line: {
      type: 'line',
      filter: geometryTypeFilter('LineString'),
      paint: {
        'line-color': color,
        'line-width': 4,
        'line-dasharray': [2, 4],
      },
    },
    polygon: {
      type: 'fill',
      filter: geometryTypeFilter('Polygon'),
      paint: {
        'fill-color': color,
        'fill-opacity': 0.4,
      },
    },
  } as Record<
    HighlightLayerKey,
    Partial<
      FillLayerSpecification | LineLayerSpecification | CircleLayerSpecification
    >
  >;
}

export function createShadowHighlightLayers(color: string) {
  return {
    pointHalo: {
      type: 'circle',
      filter: geometryTypeFilter('Point'),
      paint: {
        'circle-radius': 22,
        'circle-color': color,
        'circle-opacity': 0.45,
        'circle-blur': 0.95,
      },
    },
    lineHalo: {
      type: 'line',
      filter: geometryTypeFilter('LineString'),
      paint: {
        'line-color': color,
        'line-width': 18,
        'line-opacity': 0.4,
        'line-blur': 8,
      },
    },
    polygonHalo: {
      type: 'line',
      filter: geometryTypeFilter('Polygon'),
      paint: {
        'line-color': color,
        'line-width': 16,
        'line-opacity': 0.5,
        'line-blur': 6,
      },
    },
    point: {
      type: 'circle',
      filter: geometryTypeFilter('Point'),
      paint: {
        'circle-radius': 7,
        'circle-color': color,
        'circle-opacity': 1,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    },
    line: {
      type: 'line',
      filter: geometryTypeFilter('LineString'),
      paint: {
        'line-color': color,
        'line-width': 3,
        'line-opacity': 1,
      },
    },
    polygon: {
      type: 'fill',
      filter: geometryTypeFilter('Polygon'),
      paint: {
        'fill-color': color,
        'fill-opacity': 0.28,
      },
    },
  } as Record<
    HighlightLayerKey,
    Partial<
      FillLayerSpecification | LineLayerSpecification | CircleLayerSpecification
    >
  >;
}

export const DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY = 'highlight';

function featureStateOn(stateKey: string) {
  return ['boolean', ['feature-state', stateKey], false] as FilterSpecification;
}

function featureStatePaint(
  stateKey: string,
  onValue: number | string,
  offValue: number | string = 0,
) {
  return ['case', featureStateOn(stateKey), onValue, offValue];
}

export function createFeatureStateHighlightLayers(
  color: string,
  stateKey = DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY,
) {
  return {
    pointHalo: {
      type: 'circle',
      filter: geometryTypeFilter('Point'),
      paint: {
        'circle-radius': 18,
        'circle-color': color,
        'circle-opacity': featureStatePaint(stateKey, 0.32, 0),
        'circle-blur': 0.85,
      },
    },
    lineHalo: {
      type: 'line',
      filter: geometryTypeFilter('LineString'),
      paint: {
        'line-color': color,
        'line-width': 14,
        'line-opacity': featureStatePaint(stateKey, 0.4, 0),
        'line-blur': 6,
      },
    },
    polygonHalo: {
      type: 'line',
      filter: geometryTypeFilter('Polygon'),
      paint: {
        'line-color': color,
        'line-width': 10,
        'line-opacity': featureStatePaint(stateKey, 0.5, 0),
        'line-blur': 4,
      },
    },
    point: {
      type: 'circle',
      filter: geometryTypeFilter('Point'),
      paint: {
        'circle-radius': 7,
        'circle-color': color,
        'circle-opacity': featureStatePaint(stateKey, 0.9, 0),
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-stroke-opacity': featureStatePaint(stateKey, 1, 0),
      },
    },
    line: {
      type: 'line',
      filter: geometryTypeFilter('LineString'),
      paint: {
        'line-color': color,
        'line-width': 4,
        'line-opacity': featureStatePaint(stateKey, 1, 0),
      },
    },
    polygon: {
      type: 'fill',
      filter: geometryTypeFilter('Polygon'),
      paint: {
        'fill-color': color,
        'fill-opacity': featureStatePaint(stateKey, 0.45, 0),
      },
    },
  } as Record<
    HighlightLayerKey,
    Partial<
      FillLayerSpecification | LineLayerSpecification | CircleLayerSpecification
    >
  >;
}

export function resolveHighlightFeatureId(
  feature?: GeoJSONFeature | Feature,
): string | number | undefined {
  if (!feature) return undefined;
  if (typeof feature.id === 'string' || typeof feature.id === 'number') {
    return feature.id;
  }
  return scalarProperty(feature, 'id');
}

export function applyHighlightFeatureState(
  map: MapSimple,
  sourceId: string,
  feature?: GeoJSONFeature | Feature,
  options?: {
    filterCreator?: HighlightFilterCreator;
    stateKey?: string;
  },
): Array<string | number> {
  const stateKey = options?.stateKey ?? DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY;
  const ids = new Set<string | number>();
  const filter = toExpressionFilter(
    createHighlightFilter(feature, options?.filterCreator),
  );
  let candidates: GeoJSONFeature[] = [];
  try {
    candidates = map.querySourceFeatures(
      sourceId,
      filter ? { filter } : undefined,
    );
  } catch (error) {
    logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
      'highlight',
      'querySourceFeatures failed',
      { error, sourceId, filter },
    );
  }
  if (candidates.length === 0 && feature) {
    candidates = [feature as GeoJSONFeature];
  }
  for (const item of candidates) {
    const id = resolveHighlightFeatureId(item);
    if (id == null || ids.has(id)) continue;
    try {
      map.setFeatureState({ source: sourceId, id }, { [stateKey]: true });
      ids.add(id);
    } catch (error) {
      logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
        'highlight',
        'setFeatureState failed',
        { error, sourceId, id },
      );
    }
  }
  return Array.from(ids);
}

export function clearHighlightFeatureState(
  map: MapSimple,
  sourceId: string,
  ids: Array<string | number>,
  stateKey = DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY,
) {
  for (const id of ids) {
    try {
      map.removeFeatureState({ source: sourceId, id }, stateKey);
    } catch (error) {
      logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
        'highlight',
        'removeFeatureState failed',
        { error, sourceId, id },
      );
    }
  }
}

export function featureStatePulseAnimate(props: {
  map: MapSimple;
  layerIds: HighlightLayerIds;
  state: HighlightAnimState & { startTime: number; stateKey?: string };
}) {
  const { map, layerIds, state } = props;
  const stateKey = state.stateKey || DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY;
  const t = (performance.now() - state.startTime) / 1000;
  const pulse = 0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 4));
  setPaintIfLayer(
    map,
    layerIds.point,
    'circle-opacity',
    featureStatePaint(stateKey, Math.min(1, pulse + 0.4), 0),
  );
  setPaintIfLayer(
    map,
    layerIds.pointHalo,
    'circle-opacity',
    featureStatePaint(stateKey, pulse * 0.7, 0),
  );
  setPaintIfLayer(
    map,
    layerIds.line,
    'line-opacity',
    featureStatePaint(stateKey, Math.min(1, pulse + 0.4), 0),
  );
  setPaintIfLayer(
    map,
    layerIds.lineHalo,
    'line-opacity',
    featureStatePaint(stateKey, pulse * 0.8, 0),
  );
  setPaintIfLayer(
    map,
    layerIds.polygon,
    'fill-opacity',
    featureStatePaint(stateKey, pulse, 0),
  );
  setPaintIfLayer(
    map,
    layerIds.polygonHalo,
    'line-opacity',
    featureStatePaint(stateKey, pulse * 0.9, 0),
  );
}

export function ensureHighlightSource(
  base: (IDataset & WithDataHelper) | undefined,
  map: MapSimple,
  feature?: GeoJSONFeature,
  filterCreator?: HighlightFilterCreator,
  preferDatasetSource = false,
): { sourceId: string; isolated: boolean } {
  const highlightFilter = createHighlightFilter(feature, filterCreator);
  if (base && (highlightFilter || preferDatasetSource)) {
    const sourceLeaf = findFirstLeafByType(base, 'source');
    if (sourceLeaf) {
      const sourceId = (
        sourceLeaf as unknown as { getSourceId: () => string }
      ).getSourceId();
      logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
        'highlight',
        'use source dataset',
        { dataset: base, source: sourceLeaf, sourceId, feature },
      );
      return { sourceId, isolated: false };
    }
  }

  const sourceId = (base?.id || getUUIDv4()) + '-source-highlighted';
  const data = toGeoJSONData(feature);
  logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
    'highlight',
    'use source geojson',
    { dataset: base, sourceId, feature, data },
  );
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, { type: 'geojson', data, promoteId: 'id' });
  } else {
    (map.getSource(sourceId) as GeoJSONSource).setData(data);
  }
  return { sourceId, isolated: true };
}

function layerEntries(layerIds: HighlightLayerIds): [string, string][] {
  return Object.entries(layerIds).filter(
    (entry): entry is [string, string] =>
      typeof entry[1] === 'string' && !!entry[1],
  );
}

export function ensureHighlightLayers(
  map: MapSimple,
  layerIds: HighlightLayerIds,
  layersDefault: Record<string, Partial<LayerSpecification>>,
  dataset: WithDataHelper | undefined,
  sourceId: string,
  feature?: GeoJSONFeature,
  filterCreator?: HighlightFilterCreator,
  isolatedSource = false,
  skipHighlightFilter = false,
) {
  const highlightFilter =
    isolatedSource || skipHighlightFilter
      ? undefined
      : toExpressionFilter(createHighlightFilter(feature, filterCreator));
  layerEntries(layerIds).forEach(([key, id]) => {
    const baseLayer = layersDefault[key];
    if (!baseLayer) return;
    const datasetData = dataset?.getData() as
      | (Partial<LayerSpecification> & { filter?: FilterSpecification })
      | undefined;
    const mergedFilter = mergeFilters([
      toExpressionFilter(
        (baseLayer as { filter?: FilterSpecification }).filter,
      ),
      toExpressionFilter(datasetData?.filter),
      highlightFilter,
    ]);
    const existing = map.getLayer(id);
    if (existing && existing.source === sourceId) {
      try {
        map.setFilter(id, mergedFilter ?? null);
      } catch (error) {
        logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
          'highlight',
          'setFilter failed',
          { error, id, filter: mergedFilter },
        );
      }
      logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
        'highlight',
        'layer-update',
        { id, filter: mergedFilter, feature, highlightFilter },
      );
      return;
    }
    if (existing) {
      map.removeLayer(id);
    }
    const datasetLayer = Object.fromEntries(
      Object.entries(datasetData || {}).filter(([key]) => key !== 'filter'),
    );
    const temp = {
      id,
      source: sourceId,
      ...baseLayer,
      ...datasetLayer,
      ...(mergedFilter ? { filter: mergedFilter } : {}),
    } as LayerSpecification;
    logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
      'highlight',
      'layer',
      { layer: temp, filter: mergedFilter, feature, highlightFilter },
    );
    try {
      map.addLayer(temp);
    } catch (error) {
      logHelper(loggerHighlight, map.id, 'useHighlightAnimation').debug(
        'highlight',
        'addLayer failed',
        { error, layer: temp },
      );
    }
  });
}

export type HighlightAnimState = {
  frameId: number | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  radius?: number;
  grow?: boolean;
  dashOffset?: number;
  blinkAlpha?: number;
  blinkDir?: number;
  [key: string]: unknown;
};

export function setPaintIfLayer(
  map: MapSimple,
  layerId: string | undefined,
  name: string,
  value: unknown,
) {
  if (!layerId || !map.getLayer(layerId)) return;
  map.setPaintProperty(layerId, name, value);
}

export function defaultAnimate(props: {
  map: MapSimple;
  layerIds: HighlightLayerIds;
  state: HighlightAnimState;
}) {
  const { map, layerIds, state } = props;
  let { radius = 6, grow = true, dashOffset = 0 } = state;

  radius += grow ? 0.2 : -0.2;
  if (radius >= 12) grow = false;
  if (radius <= 6) grow = true;
  setPaintIfLayer(map, layerIds.point, 'circle-radius', radius);
  setPaintIfLayer(map, layerIds.pointHalo, 'circle-radius', radius + 10);
  setPaintIfLayer(
    map,
    layerIds.pointHalo,
    'circle-opacity',
    0.18 + (radius - 6) * 0.02,
  );

  dashOffset += 0.1;
  dashOffset = +dashOffset.toFixed(1);
  if (dashOffset >= 6) dashOffset = 0;
  setPaintIfLayer(map, layerIds.line, 'line-dasharray', [
    2 + dashOffset,
    4 + dashOffset,
  ]);
  setPaintIfLayer(
    map,
    layerIds.lineHalo,
    'line-opacity',
    0.25 + Math.abs(Math.sin(dashOffset)) * 0.2,
  );

  state.blinkAlpha = (state.blinkAlpha ?? 0.4) + (state.blinkDir ?? 1) * 0.05;
  if (state.blinkAlpha > 0.8) state.blinkDir = -1;
  if (state.blinkAlpha < 0.2) state.blinkDir = 1;
  setPaintIfLayer(map, layerIds.polygon, 'fill-opacity', state.blinkAlpha);
  setPaintIfLayer(
    map,
    layerIds.polygonHalo,
    'line-opacity',
    (state.blinkAlpha ?? 0.4) * 0.8,
  );

  state.radius = radius;
  state.grow = grow;
  state.dashOffset = dashOffset;
}

export function useHighlightAnimation<T = unknown>() {
  const animStates: Record<string, HighlightAnimState & T> = {};
  const callbacks: Record<
    string,
    {
      onStart?: () => void;
      onDone?: () => void;
      onCancel?: () => void;
    }
  > = {};

  function removeHighlightLayers(map: MapSimple, layerIds: HighlightLayerIds) {
    layerEntries(layerIds).forEach(([, layerId]) => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
    });
  }

  function cancelAnimation(map: MapSimple, cancelled = false) {
    const id = (map as MapSimple).id || 'default';
    const state = animStates[id];
    if (!state) return;
    if (state.frameId) cancelAnimationFrame(state.frameId);
    if (state.timeoutId) clearTimeout(state.timeoutId);
    delete animStates[id];
    if (cancelled) callbacks[id]?.onCancel?.();
  }

  function stopAnimation(
    map: MapSimple,
    layerIds: HighlightLayerIds,
    cancelled = true,
  ) {
    cancelAnimation(map, cancelled);
    removeHighlightLayers(map, layerIds);
  }

  function startAnimation(
    map: MapSimple,
    layerIds: HighlightLayerIds,
    durationMs = 5000,
    animateFn:
      | ((props: {
          map: MapSimple;
          layerIds: HighlightLayerIds;
          state: HighlightAnimState & T;
        }) => void)
      | null = defaultAnimate,
    initialState: Record<string, unknown> = {},
  ) {
    cancelAnimation(map, false);
    layerEntries(layerIds).forEach(([, id]) => {
      if (map.getLayer(id)) {
        map.moveLayer(id);
      }
    });
    const id = (map as MapSimple).id || 'default';

    callbacks[id]?.onStart?.();

    animStates[id] = {
      frameId: null,
      timeoutId: null,
      ...initialState,
    } as HighlightAnimState & T;

    if (animateFn) {
      const run = animateFn;
      const loop = () => {
        const state = animStates[id];
        if (!state) return;
        run({ map, layerIds, state });
        state.frameId = requestAnimationFrame(loop);
      };
      loop();
    }

    if (durationMs > 0) {
      animStates[id].timeoutId = setTimeout(() => {
        stopAnimation(map, layerIds, false);
        callbacks[id]?.onDone?.();
      }, durationMs);
    }
  }

  function initAnimation({
    layerIds,
    dataset,
    map,
    feature,
    layers,
    filterCreator,
    skipHighlightFilter = false,
  }: {
    dataset?: IDataset & WithDataHelper;
    map: MapSimple;
    feature?: GeoJSONFeature;
    layerIds: HighlightLayerIds;
    layers: Record<string, Partial<LayerSpecification>>;
    filterCreator?: HighlightFilterCreator;
    skipHighlightFilter?: boolean;
  }) {
    const { sourceId, isolated } = ensureHighlightSource(
      dataset,
      map,
      feature,
      filterCreator,
      skipHighlightFilter,
    );
    ensureHighlightLayers(
      map,
      layerIds,
      layers,
      dataset,
      sourceId,
      feature,
      filterCreator,
      isolated,
      skipHighlightFilter,
    );
    return { sourceId, isolated };
  }
  function setOnDone(map: MapSimple, cb: () => void) {
    const id = (map as MapSimple).id || 'default';
    callbacks[id] = callbacks[id] || {};
    callbacks[id].onDone = cb;
  }

  function setOnStart(map: MapSimple, cb: () => void) {
    const id = (map as MapSimple).id || 'default';
    callbacks[id] = callbacks[id] || {};
    callbacks[id].onStart = cb;
  }

  function setOnCancel(map: MapSimple, cb: () => void) {
    const id = (map as MapSimple).id || 'default';
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
