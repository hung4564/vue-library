# Highlight

Paint selected / identified features. Needs [`LayerHighlight`](../module/LayerHighlight.md) on the map (`enableClick` / `enableHover`).

**Events:** none. Duration comes from `LayerHighlight` (`durationMs`).

## Default

```ts
import { createDatasetPartHighlightComponent } from '@hungpvq/vue-map-dataset';

dataset.add(createDatasetPartHighlightComponent());
```

| Argument | Type | Role |
| --- | --- | --- |
| `data` | `Partial<LayerSpecification>` | Extra paint / layout on highlight layers |
| `options.filterCreator` | `(feature) => filter` | Custom MapLibre filter |

## Built-in variants

```ts
createDatasetPartChangeColorHighlightComponent(data?)
createDatasetPartShadowHighlightComponent(color = '#FFB703', data?, options?)
createDatasetPartFeatureStateHighlightComponent(color = '#E63946', data?, options?)
```

`options` may include `filterCreator`. Feature-state also accepts `stateKey`.

## Custom animation

```ts
import { createDatasetPartCustomAnimateHighlightComponent } from '@hungpvq/vue-map-dataset';
import type { MapSimple } from '@hungpvq/map-core';

createDatasetPartCustomAnimateHighlightComponent<{ color: string; startTime: number }>(
  ({ map, layerIds, state }) => {
    map.setPaintProperty(layerIds.point, 'circle-color', state.color);
  },
  () => ({ color: '#880808', startTime: performance.now() }),
);
```

| Argument | Role |
| --- | --- |
| `animateFn` | Called each frame (`map`, `layerIds`, `state`), or `null` |
| `createDefaultState` | Initial animation state |
| `data` | Extra layer spec |
| `options.layers` | Override point / line / polygon highlight layers |
| `options.layerIds` | Custom layer ids |
| `options.filterCreator` | Feature filter |

## Map control

```vue
<LayerHighlight enable-click enable-hover color="#004E98" :duration-ms="5000" />
```

```tsx
<LayerHighlight enableClick enableHover color="#004E98" durationMs={5000} />
```
