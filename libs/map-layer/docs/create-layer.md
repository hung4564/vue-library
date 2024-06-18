# Example Create layer

```ts
import { IBuild, ILayer, LayerAction } from '@hungpvq/vue-map-core';
import { Layer, LayerInfoShowBuild, LayerListBuild, LayerMapBuild, LayerRasterMapboxBuild, OptionDefault, RasterSource, RasterSourceBuild, setupDefault, toBoundAction, toggleShowAction } from '@hungpvq/vue-map-layer';
import { BBox } from '@turf/turf';

export function createCustomLayer(
  options: {
    name: string;
    tiles: string[];
    bounds?: BBox;
  } & OptionDefault
) {
  const layer = new Layer();
  const { name, tiles, bounds } = options;
  layer.setInfo({ name, metadata: {} });
  const builds: IBuild[] = [new RasterSourceBuild().setTiles(tiles).setBounds(bounds), new LayerListBuild(), new LayerMapBuild().setLayer(new LayerRasterMapboxBuild().build())];
  const actions: LayerAction[] = [toBoundAction(), toggleShowAction()];
  return setupDefault(layer, { builds, actions }, options);
}
```
