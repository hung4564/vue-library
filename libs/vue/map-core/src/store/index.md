---
category: Store
---

# Map Store

<FunctionInfo fn="Store" package="Map - Core"  />

## Usage

```ts
import { getMap } from '@hungpvq/map-core';
import { createMapScopedStore, destroyMapScopedStore, getStore } from '@hungpvq/vue-map-core';
```

## Create new store

```ts
createMapScopedStore(mapId, MAP_STORE_KEY.MAP_COMPARE, () => ({}));
```
