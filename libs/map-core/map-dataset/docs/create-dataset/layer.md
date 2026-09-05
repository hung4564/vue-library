# Layer

MapLibre paint layers. Pair with a [source](./source.md) on the same parent.

**Events:** none (visibility / opacity go through the [list UI](./list.md)).

## Factory

```ts
createMultiMapboxLayerComponent(name: string, layers?: BaseLayerSpec[])
```

`BaseLayerSpec` is a MapLibre `LayerSpecification` without a required `id` (an id is assigned if missing).

```ts
import {
  createMultiMapboxLayerComponent,
  LayerSimpleMapboxBuild,
} from '@hungpvq/vue-map-dataset';

const layer = createMultiMapboxLayerComponent('cities', [
  new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build(),
]);

const multi = createMultiMapboxLayerComponent('mixed', [
  new LayerSimpleMapboxBuild().setStyleType('point').setColor('#ff6b6b').build(),
  new LayerSimpleMapboxBuild().setStyleType('line').setColor('#4ecdc4').build(),
]);
```

Or pass a raw spec:

```ts
createMultiMapboxLayerComponent('fill', [
  {
    type: 'fill',
    paint: { 'fill-color': '#4ecdc4', 'fill-opacity': 0.4 },
  },
]);
```

Methods on the node: `getAllLayerIds()`, `getLayers()`, `moveLayer(map, beforeId)`, `updateValue(map, value)`.

Style editor from the list ⋮ menu uses `getComponentUpdate()` → registry key `style-control`. Mount [`ComponentManagementControl`](../module/ComponentManagementControl.md) so that dialog can open.

See [`LayerSimpleMapboxBuild`](../module/LayerSimpleMapboxBuild.md) for `point` / `line` / `area` / `symbol`.
