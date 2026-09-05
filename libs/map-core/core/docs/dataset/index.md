# Map Dataset

Library for creating, listing, styling, identifying, and grouping map layers. Vue and React packages share the same core (`@hungpvq/map-dataset`).

- Vue: `@hungpvq/vue-map-dataset`
- React: `@hungpvq/react-map-dataset`

Demo: [Vue](https://hung4564.github.io/demo-map/vue/) · [React](https://hung4564.github.io/demo-map/react/) · source in `apps/vue/demo-map` and `apps/react/demo-map`.

## Installation

### Vue

```bash
npm install @hungpvq/vue-map-dataset @hungpvq/vue-map-core @hungpvq/map-dataset @hungpvq/map-core
```

Peer packages you also need (already used by typical map apps):

```bash
npm install maplibre-gl @mdi/js @jamescoyle/vue-icon @hungpvq/vue-draggable @hungpvq/shared @hungpvq/shared-store
```

### React

```bash
npm install @hungpvq/react-map-dataset @hungpvq/react-map-core @hungpvq/map-dataset @hungpvq/map-core
```

```bash
npm install maplibre-gl @mdi/js @mdi/react @hungpvq/react-draggable @hungpvq/shared
```

Import styles once at the app root:

```ts
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
```

```ts
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';
```

## Setup

Register built-in UI pieces (legend, opacity, toggle show, **Add to group**, **Export**, **Attribute table**, style editor). Without this step those components do not render.

### Vue

```ts
import { createApp } from 'vue';
import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { createDatasetRegistryPlugin } from '@hungpvq/vue-map-dataset';
import App from './App.vue';

const app = createApp(App);
app.use(createStoreRegistryPlugin());
app.use(createDatasetRegistryPlugin());
app.mount('#app');
```

### React

```ts
import { createDatasetRegistryPlugin } from '@hungpvq/react-map-dataset';

createDatasetRegistryPlugin().install();
```

## Features

- Dataset tree: source, layer, list UI, identify, highlight, data management
- Layer list: show/hide, opacity, delete, drag-and-drop groups
- Reorder in the list: **Move up** / **Move down**
- **Add to group** from the layer context menu
- Custom menus: extra / bottom / prebottom / context menu
- Menu **hidden** / **disabled** from layer data **or** external state (Pinia, React context)
- Custom context-menu UI via `setComponentMenuKey`
- Identify, style editor, legends
- **Export** GeoJSON layers as GeoJSON / KML / CSV / Shapefile
- **Attribute table** for GeoJSON feature properties (click a row to zoom / highlight)

## Quick start (Vue)

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
    <IdentifyControl position="top-right" />
    <LayerHighlight enable-click />
    <ComponentManagementControl />
  </Map>
</template>

<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { getUUIDv4 } from '@hungpvq/shared';
import { Map, BaseMapCard } from '@hungpvq/vue-map-core';
import {
  LayerControl,
  IdentifyControl,
  LayerHighlight,
  ComponentManagementControl,
  useMapDataset,
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
  createDatasetPartGeojsonSourceComponent,
  createMultiMapboxLayerComponent,
  LayerSimpleMapboxBuild,
} from '@hungpvq/vue-map-dataset';
import { ref } from 'vue';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';

const mapId = ref(getUUIDv4());

function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);

  const dataset = createRootDataset('Sample');
  const list = createDatasetPartListViewUiComponentBuilder('Hanoi')
    .setColor('#ff6b6b')
    .build();
  const source = createDatasetPartGeojsonSourceComponent('source', {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: 'Hanoi' },
        geometry: { type: 'Point', coordinates: [105.8342, 21.0285] },
      },
    ],
  });
  const layer = createMultiMapboxLayerComponent('layer', [
    new LayerSimpleMapboxBuild().setStyleType('point').setColor(list.color).build(),
  ]);

  dataset.add(source);
  dataset.add(list);
  dataset.add(layer);
  addDataset(dataset);
}
</script>
```

## Quick start (React)

```tsx
import type { MapSimple } from '@hungpvq/map-core';
import { Map, BaseMapCard } from '@hungpvq/react-map-core';
import {
  LayerControl,
  IdentifyControl,
  LayerHighlight,
  ComponentManagementControl,
  useMapDataset,
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
} from '@hungpvq/react-map-dataset';
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';

function Page() {
  function onMapLoaded(map: MapSimple) {
    const { addDataset } = useMapDataset(map.id);
    const dataset = createRootDataset('Sample');
    dataset.add(
      createDatasetPartListViewUiComponentBuilder('Layer').build(),
    );
    addDataset(dataset);
  }

  return (
    <Map onMapLoaded={onMapLoaded}>
      <LayerControl
        position="top-left"
        show
        endList={({ mapId }) => <BaseMapCard mapId={mapId} />}
      />
      <IdentifyControl position="top-right" />
      <LayerHighlight enableClick />
      <ComponentManagementControl />
    </Map>
  );
}
```

Shorthand for a full GeoJSON layer: [`createGeoJsonDataset`](./helper/QuickDatasetCreation.md).

Create-layer parses GeoJSON and reprojects CRS in a [Web Worker](./worker.md). Vite apps need `worker.format: 'es'` (and `worker.plugins` with `nxViteTsPaths` in this monorepo).

## Next

- [GIS worker](./worker.md) — Vite / Nx config so parse + CRS stay off the main thread
- [Create a dataset](./create-dataset/) — tree, source, layer, list UI
- [Components](./module/) — LayerControl, Identify, Highlight, DatasetControl, props / events
- [Menus](./create-dataset/with-helper-menu.md) — `createMenuBuilder`, `setHidden` / `setDisabled`, custom menu component
- [Events](./create-dataset/with-helper-event.md) — `toggleShow` / `changeOpacity` on list nodes
- [Attribute table](./create-dataset/attribute-table.md) — feature properties, click to zoom
- [Export](./create-dataset/export.md) — GeoJSON / KML / CSV / Shapefile
