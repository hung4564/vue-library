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

**Import paths (breaking major):** domain APIs live on subpaths — e.g. `createGeoJsonDataset` from `@hungpvq/map-dataset/geojson`, attribute-table from `@hungpvq/map-dataset/attribute-table`, `LIST_VIEW_MENU_*` from `@hungpvq/map-dataset/menu`, `LayerSimpleMapboxBuild` from `@hungpvq/map-dataset/style`. Root keeps `DatasetService`, tree helpers, highlight, and shared `IDataset` types. See [Stable API](/map/core/stable-api).

```ts
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';
```

Or import the shared core styles directly:

```ts
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
```

You only need one set. Prefer the framework packages (`vue-*` / `react-*`) so styles stay aligned with the wrappers you use.

## Setup

Bootstrap once with `installMapApp` (theme + built-in UI: legend, opacity, toggle show, **Add to group**, **Export**, **Attribute table**, style editor). Without this step those components do not render. Prefer `installMapApp` over `createDatasetRegistryPlugin()` alone.

### Vue

```ts
import { createApp } from 'vue';
import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { installMapApp } from '@hungpvq/vue-map-dataset';
import App from './App.vue';

const app = createApp(App);
app.use(createStoreRegistryPlugin());
installMapApp(app);
app.mount('#app');
```

### React

```ts
import { installMapApp } from '@hungpvq/react-map-dataset';

installMapApp();
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
} from '@hungpvq/vue-map-dataset';
import { createRootDataset, createDatasetPartListViewUiComponentBuilder, createMultiMapboxLayerComponent } from '@hungpvq/map-dataset';
import { createDatasetPartGeojsonSourceComponent } from '@hungpvq/map-dataset/geojson';
import { LayerSimpleMapboxBuild } from '@hungpvq/map-dataset/style';
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
} from '@hungpvq/react-map-dataset';
import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
} from '@hungpvq/map-dataset';
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

Create-layer parses GIS and reprojects CRS in a [Web Worker](./worker.md). Apps on npm need `mapDatasetGisWorker()`; this monorepo needs `worker.format: 'es'` (+ `nxViteTsPaths` on `worker.plugins`). Install optional GIS peers when using CreateControl — see [CreateControl](./module/CreateControl.md).

## Domain `src/extra` vs adapter `extra`

| Location | Role | Published? |
| --- | --- | --- |
| `libs/map-core/map-dataset/src/extra/` | Framework-agnostic helpers (field builders, locales, …) that feed domain entries | **No** — not a package export; use `@hungpvq/map-dataset` / `@hungpvq/map-dataset/<domain>` |
| `libs/vue\|react/map-dataset/src/extra/` | Framework UI for menu actions / condition context (`ToggleShow`, `DatasetMenuButton`, …) | Internal only; surfaces via adapter root named exports |

Import builders, identify, menu protocol, create-control GIS APIs from `@hungpvq/map-dataset/...` — never from adapter `extra/` barrels. Do not reintroduce adapter `builder` / `model` / `services` re-exports of domain code.

## Next

- [GIS worker](./worker.md) — npm app vs Nx monorepo setup so parse + CRS stay off the main thread
- [Create a dataset](./create-dataset/) — tree, source, layer, list UI
- [Components](./module/) — LayerControl, Identify, Highlight, DatasetControl, props / events
- [Menus](./create-dataset/with-helper-menu.md) — `createMenuBuilder`, `setHidden` / `setDisabled`, custom menu component
- [Events](./create-dataset/with-helper-event.md) — `toggleShow` / `changeOpacity` on list nodes
- [Attribute table](./create-dataset/attribute-table.md) — feature properties, click to zoom
- [Export](./create-dataset/export.md) — GeoJSON / KML / CSV / Shapefile
