import type { MapSimple } from '@hungpvq/map-core';
import type { LayerSpecification } from 'maplibre-gl';

import type { WithDataHelper } from '../extra/data';
import type { IDataset } from '../interfaces/dataset.base';
import {
  applyHighlightFeatureState,
  clearHighlightFeatureState,
  createDefaultHighlightLayerIds,
  createDefaultHighlightLayers,
  createFeatureStateHighlightLayers,
  createShadowHighlightLayers,
  DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY,
  defaultAnimate,
  ensureHighlightLayers,
  ensureHighlightSource,
  featureStatePulseAnimate,
  type HighlightAnimState,
  setPaintIfLayer,
} from './paint-layers';
import type { IHighlightPart } from './part';
import { markerCentroidCollection } from './popup';
import { mergeEntriesToFeatureCollection } from './resolve-data';
import type {
  HighlightAnimateFn,
  HighlightEntry,
  HighlightFilterCreator,
  HighlightGeoJson,
  HighlightLayerIds,
  HighlightStyle,
} from './types';

type HighlightPaintDataset = IDataset & Partial<WithDataHelper>;

type PaintSession = {
  stop: (map: MapSimple) => void;
  clearFeatureState?: (map: MapSimple) => void;
};

function layerEntries(layerIds: HighlightLayerIds) {
  return Object.entries(layerIds).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
}

/** Private paint animation session — replaces former public `useHighlightAnimation`. */
function createPaintAnimationSession() {
  const animStates: Record<string, HighlightAnimState> = {};
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
    animateFn: HighlightAnimateFn | null = defaultAnimate,
    initialState: Record<string, unknown> = {},
  ) {
    cancelAnimation(map, false);
    layerEntries(layerIds).forEach(([, lid]) => {
      if (map.getLayer(lid)) {
        map.moveLayer(lid);
      }
    });
    const id = (map as MapSimple).id || 'default';

    callbacks[id]?.onStart?.();

    animStates[id] = {
      frameId: null,
      timeoutId: null,
      ...initialState,
    };

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
    dataset?: HighlightPaintDataset;
    map: MapSimple;
    feature?: HighlightGeoJson;
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

  return {
    startAnimation,
    stopAnimation,
    initAnimation,
    setOnDone,
  };
}

function changeColorAnimate({
  map,
  layerIds,
  state,
}: {
  map: MapSimple;
  layerIds: HighlightLayerIds;
  state: Record<string, unknown>;
}) {
  const startTime =
    typeof state['startTime'] === 'number'
      ? state['startTime']
      : performance.now();
  state['startTime'] = startTime;
  const t = (performance.now() - startTime) / 1000;
  const hue = (t * 60) % 360;
  const c = `hsl(${hue}, 80%, 50%)`;
  const opacity = 0.4 + 0.3 * Math.sin(t * 2);
  const radius = 6 + Math.sin(t * 3) * 2;
  setPaintIfLayer(map, layerIds.point, 'circle-stroke-color', c);
  setPaintIfLayer(map, layerIds.point, 'circle-radius', radius);
  setPaintIfLayer(map, layerIds.point, 'circle-opacity', opacity);
  setPaintIfLayer(map, layerIds.line, 'line-color', c);
  setPaintIfLayer(map, layerIds.line, 'line-opacity', opacity);
  setPaintIfLayer(map, layerIds.polygon, 'fill-color', c);
  setPaintIfLayer(map, layerIds.polygon, 'fill-opacity', opacity);
}

/**
 * Paint all entries using the latest entry's style (P0 rule).
 */
export function createHighlightPainter(controllerId: string) {
  const anim = createPaintAnimationSession();
  let session: PaintSession | undefined;
  const layerIds = createDefaultHighlightLayerIds(`hl-ctrl-${controllerId}`);

  function stop(map: MapSimple | null | undefined) {
    if (!map || typeof map.getLayer !== 'function') {
      session = undefined;
      return;
    }
    try {
      session?.clearFeatureState?.(map);
      session?.stop(map);
      anim.stopAnimation(map, layerIds);
    } catch {
      // Map may already be removed during unmount races.
    }
    session = undefined;
  }

  function paint(
    map: MapSimple,
    entries: HighlightEntry[],
    part?: IHighlightPart,
    onDone?: () => void,
  ) {
    stop(map);
    if (!entries.length) return;

    const latest = entries[entries.length - 1];
    const style: HighlightStyle = latest.style;
    const mode = style.mode ?? 'default';
    const color = style.color ?? '#004E98';
    const durationMs = style.durationMs ?? 5000;
    const dataType = latest.data.type;

    const fc = mergeEntriesToFeatureCollection(entries.map((e) => e.feature));
    const paintFc = mode === 'marker' ? markerCentroidCollection(fc) : fc;

    if (
      dataType === 'vector-tile' &&
      (latest.data.strategy ?? 'feature-state') === 'feature-state'
    ) {
      const sourceId =
        latest.data.type === 'vector-tile' ? latest.data.source : undefined;
      if (!sourceId) return;
      const stateKey = style.stateKey ?? DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY;
      const layers = createFeatureStateHighlightLayers(color, stateKey);
      const ids = applyHighlightFeatureState(map, sourceId, paintFc, {
        filterCreator: style.filterCreator ?? part?.getFilterCreator?.(),
        stateKey,
      });
      anim.initAnimation({
        map,
        layerIds,
        layers: layers as never,
        feature: paintFc,
        filterCreator: style.filterCreator,
        skipHighlightFilter: true,
      });
      anim.setOnDone(map, () => onDone?.());
      const pulseAnimate =
        mode === 'pulse' || mode === 'default'
          ? (featureStatePulseAnimate as HighlightAnimateFn)
          : mode === 'changeColor'
            ? changeColorAnimate
            : mode === 'custom' && style.animate
              ? style.animate
              : (featureStatePulseAnimate as HighlightAnimateFn);
      anim.startAnimation(map, layerIds, durationMs, pulseAnimate, {
        startTime: performance.now(),
        stateKey,
      });
      session = {
        stop: (m) => anim.stopAnimation(m, layerIds),
        clearFeatureState: (m) =>
          clearHighlightFeatureState(m, sourceId, ids, stateKey),
      };
      return;
    }

    let layers = createDefaultHighlightLayers(color) as Record<string, never>;
    if (mode === 'outline') {
      layers = createShadowHighlightLayers(color) as never;
    } else if (mode === 'fill') {
      const base = createDefaultHighlightLayers(color);
      const fillOpacity = style.paint?.fillOpacity ?? 0.45;
      layers = {
        ...base,
        polygon: {
          ...base.polygon,
          paint: {
            ...(base.polygon as { paint?: object }).paint,
            'fill-opacity': fillOpacity,
          },
        },
      } as never;
    } else if (mode === 'pulse') {
      layers = createDefaultHighlightLayers(color) as never;
    }

    if (style.paint?.pointRadius != null) {
      const l = layers as { point?: { paint?: Record<string, unknown> } };
      l.point = {
        ...l.point,
        paint: {
          ...l.point?.paint,
          'circle-radius': style.paint.pointRadius,
        },
      };
    }

    anim.initAnimation({
      map,
      layerIds,
      layers: layers as never,
      dataset: part as never,
      feature: paintFc,
      filterCreator: style.filterCreator ?? part?.getFilterCreator?.(),
    });

    let animateFn: HighlightAnimateFn | null =
      defaultAnimate as HighlightAnimateFn;
    let initialState: Record<string, unknown> = {
      radius: style.paint?.pointRadius ?? 6,
      dashOffset: 0,
      blinkAlpha: 0.4,
      blinkDir: 1,
    };

    if (mode === 'changeColor') {
      animateFn = changeColorAnimate;
      initialState = { startTime: performance.now() };
    } else if (mode === 'pulse') {
      animateFn = featureStatePulseAnimate as HighlightAnimateFn;
      initialState = {
        startTime: performance.now(),
        stateKey: style.stateKey ?? DEFAULT_HIGHLIGHT_FEATURE_STATE_KEY,
        radius: style.paint?.pointRadius ?? 6,
        dashOffset: 0,
        blinkAlpha: 0.4,
        blinkDir: 1,
      };
    } else if (mode === 'custom' && style.animate) {
      animateFn = style.animate;
      initialState = style.createDefaultState?.() ?? {};
    } else if (mode === 'outline') {
      animateFn = null;
      initialState = {};
    } else if (mode === 'marker') {
      animateFn = defaultAnimate as HighlightAnimateFn;
    }

    anim.setOnDone(map, () => onDone?.());
    anim.startAnimation(
      map,
      layerIds,
      durationMs,
      mode === 'outline' ? null : animateFn,
      initialState,
    );

    session = {
      stop: (m) => anim.stopAnimation(m, layerIds),
    };
  }

  return { paint, stop };
}
