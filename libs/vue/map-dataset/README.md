# @hungpvq/vue-map-dataset

Vue 3 UI for map datasets: layer list, groups, identify, legends, and menus. Logic lives in [`@hungpvq/map-dataset`](../../map-core/map-dataset). React counterpart: [`@hungpvq/react-map-dataset`](../../react/map-dataset).

**Docs:** [Getting started](./docs/index.md) · [Components](./docs/module/) · [Menus](./docs/create-dataset/with-helper-menu.md) · [Events](./docs/create-dataset/with-helper-event.md)

## Install

```bash
npm install @hungpvq/vue-map-dataset @hungpvq/vue-map-core @hungpvq/map-dataset @hungpvq/map-core
```

```ts
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
```

Register once at app bootstrap:

```ts
import { createApp } from 'vue';
import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { createDatasetRegistryPlugin } from '@hungpvq/vue-map-dataset';

const app = createApp(App);
app.use(createStoreRegistryPlugin());
app.use(createDatasetRegistryPlugin());
```

## Usage

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show />
  </Map>
</template>

<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { Map } from '@hungpvq/vue-map-core';
import {
  LayerControl,
  useMapDataset,
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';

const mapId = ref(getUUIDv4());

function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  const dataset = createRootDataset('Sample');
  dataset.add(createDatasetPartListViewUiComponentBuilder('Layer').build());
  addDataset(dataset);
}
</script>
```

## What is included

- `LayerControl` / `LayerInfoControl` — editable or read-only layer list
- `IdentifyControl` / `IdentifyShowFirstControl` / `LayerHighlight`
- `DatasetControl` / `ComponentManagementControl` (dialogs from menus)
- Dataset builders (GeoJSON, raster, list UI, highlight, …)
- Layer menus: extra / bottom / context menu
- `setHidden` / `setDisabled` with `menuContext` (Pinia, props, …)
- `setComponentMenuKey` for custom context-menu UI
- Built-in **Move up/down** and **Add to group**
- List-node events: `toggleShow`, `changeOpacity`

## License

MIT
