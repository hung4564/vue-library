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
  useHighlightAnimation as createHighlightAnimation,
} from '@hungpvq/map-dataset';
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  GeoJSONFeature,
  LayerSpecification,
  LineLayerSpecification,
} from 'maplibre-gl';
import { loggerHighlight } from '../../logger';

/** Framework-agnostic default highlight animator (same as Vue useDefaultHighlight). */
export function createDefaultHighlight(color = '#004E98'): HighlightHandle & {
  setDataset(p_dataset?: IHighlightView): void;
} {
  const {
    startAnimation: _startAnimation,
    stopAnimation: _stopAnimation,
    initAnimation: _initAnimation,
    setOnDone,
  } = createHighlightAnimation();

  let dataset: IHighlightView | undefined;
  const layerIds: HighlightLayerIds =
    createDefaultHighlightLayerIds('layer-highlighted');
  const layers = createDefaultHighlightLayers(color) as Record<
    string,
    Partial<
      | FillLayerSpecification
      | LineLayerSpecification
      | CircleLayerSpecification
    >
  >;

  function setDataset(p_dataset?: IHighlightView) {
    dataset = p_dataset;
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
      { map, layerIds, layers, dataset, feature },
    );
    _initAnimation({
      map,
      layerIds,
      layers: layers as Record<string, Partial<LayerSpecification>>,
      dataset,
      feature,
      filterCreator: dataset?.getFilterCreator?.(),
    });
    _startAnimation(map, layerIds, durationMs, defaultAnimate, {
      radius: 6,
      dashOffset: 0,
      blinkAlpha: 0.4,
      blinkDir: 1,
    });
  }

  function stopAnimation(map: MapSimple) {
    _stopAnimation(map, layerIds);
  }

  return { startAnimation, setDataset, stopAnimation, setOnDone };
}
