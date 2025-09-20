import { toValue } from '@hungpvq/shared';
import { logHelper, type MapSimple } from '@hungpvq/shared-map';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONFeature,
  LineLayerSpecification,
} from 'maplibre-gl';
import { ref, shallowRef } from 'vue';
import type { WithDataHelper } from '../../extra';
import type { IDataset } from '../../interfaces';
import { loggerHighlight } from '../../logger';
import type { HighlightHandle } from '../../model';
import {
  createDefaultHighlightLayers,
  defaultAnimate,
  useHighlightAnimation,
} from '../../model/highlight/helper';

export function useDefaultHighlight(color = '#004E98'): HighlightHandle & {
  setDataset(p_dataset?: IDataset & WithDataHelper): void;
} {
  const {
    startAnimation: _startAnimation,
    stopAnimation: _stopAnimation,
    initAnimation: _initAnimation,
    setOnDone,
  } = useHighlightAnimation();
  const dataset = shallowRef<(IDataset & WithDataHelper) | undefined>(
    undefined,
  );
  const layerId = 'layer-highlighted';
  type LayerKey = 'point' | 'line' | 'polygon';
  const layerIds = ref<Record<LayerKey, string>>({
    point: `${layerId}-point`,
    line: `${layerId}-line`,
    polygon: `${layerId}-polygon`,
  });

  const layers = ref<
    Record<
      LayerKey,
      Partial<
        | FillLayerSpecification
        | LineLayerSpecification
        | CircleLayerSpecification
      >
    >
  >(createDefaultHighlightLayers(color));
  function setDataset(p_dataset?: IDataset & WithDataHelper) {
    dataset.value = p_dataset;
  }
  function startAnimation({
    map,
    feature,
    durationMs = 5000, // destructuring default value
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
      layerIds: toValue(layerIds) as Record<string, string>,
      layers: toValue(layers.value) as any,
      dataset: dataset.value,
      feature,
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
