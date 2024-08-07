import { ILayer } from '@hungpvq/vue-map-core';
import { LayerBuilder } from '../build';
import { OptionDefault } from './type';

export function setupDefault(
  layer: ILayer,
  default_options: Required<OptionDefault>,
  options: OptionDefault = {}
) {
  const { builds: default_builds, actions } = default_options;
  let { builds = [] } = options;
  if (default_builds) {
    builds = [...default_builds, ...builds];
  }
  builds.unshift(LayerBuilder.action().addActions(actions));
  builds.unshift(LayerBuilder.component());
  builds.forEach((build) => {
    if (build.setForLayer) build.setForLayer(layer);
    if (build.build) {
      const view = build.build(layer, build.option);
      view.setParent(layer);
      layer.setView(build.key, view);
    }
  });
  return layer;
}
