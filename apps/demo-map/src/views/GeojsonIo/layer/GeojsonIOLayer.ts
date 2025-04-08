import {
  getChartRandomColor,
  IBuild,
  LayerAction,
} from '@hungpvq/vue-map-core';
import {
  GeoJsonSourceBuild,
  Layer,
  LayerBuilder,
  LayerSimpleMapboxBuild,
  OptionDefault,
  setupDefault,
  toBoundAction,
} from '@hungpvq/vue-map-layer';
import type { GeoJSON } from 'geojson';

export function createGeojsonIOLayer(
  options: OptionDefault & {
    geojson: GeoJSON;
  }
) {
  const { geojson } = options;
  const color = getChartRandomColor();
  const layer = new Layer();
  layer.setInfo({ name: 'GeojsonIo', metadata: {} });
  const builds: IBuild[] = [
    LayerBuilder.source(new GeoJsonSourceBuild()).setData(geojson),
    LayerBuilder.list().disableOpacity().disableDelete(),
    LayerBuilder.map().setLayer(
      new LayerSimpleMapboxBuild().setStyleType('line').setColor(color).build()
    ),
  ];
  const actions: LayerAction[] = [toBoundAction()];
  return setupDefault(layer, { builds, actions }, options);
}
