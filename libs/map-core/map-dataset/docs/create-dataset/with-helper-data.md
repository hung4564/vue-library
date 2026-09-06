# Data helper

In-memory payload on a node (`getData` / `setData`). Used by source, layer, highlight, and bound factories.

**Events:** none.

```ts
import { createWithDataHelper, createDatasetLeaf } from '@hungpvq/vue-map-dataset';

const data = createWithDataHelper({ count: 0 });

const leaf = {
  ...createDatasetLeaf('counter'),
  type: 'counter',
  ...data,
};

leaf.getData(); // { count: 0 }
leaf.setData({ count: 1 });
```

GeoJSON source wraps this: `source.getData()` is the FeatureCollection; `source.updateData(map, next)` also updates the MapLibre source.

## Bound (`createDatasetPartBoundComponent`)

Stores a `BBox` directly in data. Invalid bbox throws.

```ts
import {
  createDatasetPartBoundComponent,
  createMenuItemToBoundActionForList,
  createRootDataset,
  createDatasetPartListViewUiComponent,
} from '@hungpvq/vue-map-dataset';

const dataset = createRootDataset('Cities');
const bound = createDatasetPartBoundComponent('Cities', [
  105.83, 21.02, 105.85, 21.04,
]);
const list = createDatasetPartListViewUiComponent('Cities');

// Do not pass `bbox` into the menu — Fill bound reads from the bound part at click time
list.addMenus([createMenuItemToBoundActionForList()]);

dataset.add(bound);
dataset.add(list);

// Later (external button, after data reload, …): update bbox
bound.setData([105.5, 20.5, 106.5, 21.5]);
// Next Fill bound click uses the new value via bound.getData()
```

`createMenuItemToBoundActionForList` resolve order:

1. `bbox` argument (if passed — freezes the value at menu creation)
2. nearest `bound` part (`getData()`)
3. nearest `metadata` part (`metadata.bbox`)
4. `info.metadata.bbox` on the list node
