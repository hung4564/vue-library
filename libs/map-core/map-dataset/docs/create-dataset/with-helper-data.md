# Data helper

In-memory payload on a node (`getData` / `setData`). Used by source, layer, and highlight factories.

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
