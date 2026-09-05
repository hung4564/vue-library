import { logHelper, type MapSimple } from '@hungpvq/map-core';
import type {
  HighlightHandle,
  HighlightLayerIds,
  IHighlightView,
} from '@hungpvq/map-dataset';
import {
  createDefaultHighlightLayerIds,
  createDefaultHighlightLayers,
  defaultAnimate,
  useHighlightAnimation,
} from '@hungpvq/map-dataset';
import { toValue } from '@hungpvq/shared';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONFeature,
  LineLayerSpecification,
} from 'maplibre-gl';
import { ref, shallowRef } from 'vue';
import { loggerHighlight } from '../../logger';

export function useDefaultHighlight(color = '#004E98'): HighlightHandle & {
  setDataset(p_dataset?: IHighlightView): void;
} {
  const {
    startAnimation: _startAnimation,
    stopAnimation: _stopAnimation,
    initAnimation: _initAnimation,
    setOnDone,
  } = useHighlightAnimation();
  const dataset = shallowRef<IHighlightView | undefined>(undefined);
  const layerIds = ref<HighlightLayerIds>(
    createDefaultHighlightLayerIds('layer-highlighted'),
  );

  const layers = ref(
    createDefaultHighlightLayers(color) as Record<
      string,
      Partial<
        | FillLayerSpecification
        | LineLayerSpecification
        | CircleLayerSpecification
      >
    >,
  );
  function setDataset(p_dataset?: IHighlightView) {
    dataset.value = p_dataset;
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
    logHelper(loggerHighlight, map.id, 'useDefaultHighlight').debug(
      'initAnimation',
      {
        map,
        layerIds: toValue(layerIds) as Record<string, string>,
        layers: toValue(layers.value) as any,
        dataset: dataset.value,
        feature,
      },
    );
    _initAnimation({
      map,
      layerIds: toValue(layerIds) as HighlightLayerIds,
      layers: toValue(layers.value) as any,
      dataset: dataset.value,
      feature,
      filterCreator: dataset.value?.getFilterCreator?.(),
    });
    logHelper(loggerHighlight, map.id, 'useDefaultHighlight').debug(
      'startAnimation',
      {
        map,
        layerIds: layerIds.value,
        durationMs,
        radius: 6,
        dashOffset: 0,
        blinkAlpha: 0.4,
        blinkDir: 1,
      },
    );
    _startAnimation(map, layerIds.value, durationMs, defaultAnimate, {
      radius: 6,
      dashOffset: 0,
      blinkAlpha: 0.4,
      blinkDir: 1,
    });
  }
  function stopAnimation(map: MapSimple) {
    _stopAnimation(map, layerIds.value);
    logHelper(loggerHighlight, map.id, 'useDefaultHighlight').debug(
      'stopAnimation',
      {
        map,
      },
    );
  }
  return { startAnimation, setDataset, stopAnimation, setOnDone };
}
