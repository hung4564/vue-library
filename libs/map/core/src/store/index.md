---
category: Store
---

# Map Store

<FunctionInfo fn="Store" package="Map - Core"  />

## Usage

```ts
import { addStore, getMap, getStore, addToQueue } from '@hungpvq/vue-map-core';
```

## Create new store

```ts
import { addStore, getStore, addToQueue } from '@hungpvq/vue-map-core';
export const KEY = 'layer';
export type MapLayerStore = {
  layers: Record<string, any>;
  layerIds: Ref<string[]>;
};
export function initMapLayer(mapId: string) {
  addStore<MapLayerStore>(mapId, KEY, { layers: {}, layerIds: ref([]) });
}
addToQueue(KEY, initMapLayer);
export function getLayerIds(mapId: string) {
  const store = getStore<MapLayerStore>(mapId, KEY);
  return store.layerIds;
}
```
