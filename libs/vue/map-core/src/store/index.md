---
category: Store
---

# Map Store

<FunctionInfo fn="Store" package="Map - Core"  />

Framework adapters expose scoped store helpers. The MapLibre instance itself is accessed with **`getMap` from `@hungpvq/map-core`** (one map per `mapId`). Full guide: [map-store.md](../../../../map-core/core/docs/core/map-store.md).

## Usage

```ts
import { getMap, MAP_STORE_KEY } from '@hungpvq/map-core';
import {
  createMapScopedStore,
  destroyMapScopedStore,
  getStore,
} from '@hungpvq/vue-map-core';

getMap(mapId, (map) => {
  // single MapLibre instance for this mapId
});

createMapScopedStore(mapId, MAP_STORE_KEY.CRS, () => ({}));
const crs = getStore(mapId, MAP_STORE_KEY.CRS);
```

React: import `createMapScopedStore` / `getStore` from `@hungpvq/react-map-core` the same way.
