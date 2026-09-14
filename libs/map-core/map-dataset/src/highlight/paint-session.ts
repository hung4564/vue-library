/**
 * Private paint animation session — not a package export.
 * Replaces former public `useHighlightAnimation`.
 */
import type { MapSimple } from '@hungpvq/map-core';
import type { LayerSpecification } from 'maplibre-gl';
import type { WithDataHelper } from '../extra';
import type { IDataset } from '../interfaces';
import {
  defaultAnimate,
  ensureHighlightLayers,
  ensureHighlightSource,
  type HighlightAnimState,
} from './paint-layers';
import type {
  HighlightAnimateFn,
  HighlightFilterCreator,
  HighlightGeoJson,
  HighlightLayerIds,
} from './types';

function layerEntries(layerIds: HighlightLayerIds) {
  return Object.entries(layerIds).filter(
    (entry): entry is [string, string] => typeof entry[1] === 'string',
  );
}

type PaintAnimateFn = HighlightAnimateFn;

export function createPaintAnimationSession() {
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
    animateFn: PaintAnimateFn | null = defaultAnimate,
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
    dataset?: IDataset & WithDataHelper;
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
