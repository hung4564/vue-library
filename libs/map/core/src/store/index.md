---
category: Store
---

# Map Store

<FunctionInfo fn="Store" package="Map - Core"  />

## Usage

```ts
import { createMapScopedStore, destroyMapScopedStore, getMap, getStore } from '@hungpvq/vue-map-core';
```

## Create new store

```ts
createMapScopedStore(mapId, MAP_STORE_KEY.MAP_COMPARE, () => ({}));
```
