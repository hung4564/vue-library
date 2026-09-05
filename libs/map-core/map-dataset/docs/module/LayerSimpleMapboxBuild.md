# LayerSimpleMapboxBuild

Fluent MapLibre layer spec: `point` (circle), `line`, `area` (fill), `symbol`.

```typescript
import { LayerSimpleMapboxBuild, createMultiMapboxLayerComponent, createRootDataset } from '@hungpvq/vue-map-dataset';

const spec = new LayerSimpleMapboxBuild()
  .setStyleType('point')
  .setColor('#ff6b6b')
  .setOpacity(0.8)
  .build();

const layer = createMultiMapboxLayerComponent('sample-layer', [spec]);
createRootDataset('Sample').add(layer);
```

| Method | Role |
| --- | --- |
| `setStyleType('point' \| 'line' \| 'area' \| 'symbol')` | Layer kind |
| `setColor` | Paint color |
| `setOpacity` | Paint opacity |
| `setFilter` | MapLibre filter |
| `build()` | Spec without `id` |

Raster: `new LayerRasterMapboxBuild().build()` → `{ type: 'raster' }`.

Pass the spec into `createMultiMapboxLayerComponent` (see [layer](../create-dataset/layer.md)).
