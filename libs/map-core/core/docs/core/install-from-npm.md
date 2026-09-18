# Install from npm (external apps)

Guide for **apps outside this monorepo** that install `@hungpvq/*` from the npm registry (greenfield).

Related: [Getting started](../index.md) · [Minimal starter](./minimal-starter.md) · [Peers and bundle](./peers-and-bundle.md) · [Stable API](./stable-api.md) · [Try local consumers](./try-local-consumers.md) (`file:` → sibling `vue-3-test-map` / `react-demo-map`)

## What to install

**Recommended — meta package** (pulls map-core, map-dataset, framework adapters, draggable, shared):

```bash
# Vue
npm install @hungpvq/vue-map maplibre-gl vue

# React
npm install @hungpvq/react-map maplibre-gl react react-dom
```

`maplibre-gl` and the framework stay **peers** (single instance in the app). Do not rely on a second copy nested under `@hungpvq/*`.

### Version family

Map packages release together under tag `map@{version}` (fixed group). Prefer aligning `@hungpvq/map-*` / `vue-map-*` / `react-map-*` on the **same minor**. Meta packages declare `^` ranges on the stack; pin or lockfile if you need stricter control.

## Meta vs domain imports

| From meta (`@hungpvq/vue-map` / `react-map`) | Still import from domain packages |
|-----------------------------------------------|-----------------------------------|
| `installMapApp` (+ Vue `createMapAppPlugin`) | UI: `Map`, controls → `vue-map-core` / `react-map-core` |
| `./style.css` (all shell CSS) | Dataset UI: `LayerControl`, hooks → `vue-map-dataset` / `react-map-dataset` |
| Transitive deps (core, dataset, draggable, shared, icons) | Builders / types: `@hungpvq/map-core`, `@hungpvq/map-dataset` (and subpaths) |

Meta is an **install + bootstrap bag**, not a barrel of every component.

## Bootstrap (once per app)

```ts
// Vue
import { createApp } from 'vue';
import { installMapApp } from '@hungpvq/vue-map';
import '@hungpvq/vue-map/style.css';

const app = createApp(App);
installMapApp(app);
app.mount('#app');
```

```ts
// React — call once at app entry (before first map mount)
import { installMapApp } from '@hungpvq/react-map';
import '@hungpvq/react-map/style.css';

installMapApp();
```

Without `installMapApp`, layer menus / style / export / attribute table UI **do not register**.

## Minimal map (copy-paste)

Same UI as [Minimal starter](./minimal-starter.md), with meta CSS + bootstrap.

### Vue

```vue
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import type { FeatureCollection } from 'geojson';

const sample: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [106.7, 10.8] },
    },
  ],
};

function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(
    createGeoJsonDataset({
      name: 'Sample points',
      geojson: sample,
      type: 'point',
      color: '#e74c3c',
    }),
  );
}
</script>

<template>
  <Map @mapLoaded="onMapLoaded">
    <LayerControl position="top-left" show />
  </Map>
</template>
```

Entry:

```ts
import { createApp } from 'vue';
import { installMapApp } from '@hungpvq/vue-map';
import '@hungpvq/vue-map/style.css';
import App from './App.vue';

const app = createApp(App);
installMapApp(app);
app.mount('#app');
```

### React

```tsx
import type { MapSimple } from '@hungpvq/map-core';
import { Map } from '@hungpvq/react-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/react-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import type { FeatureCollection } from 'geojson';

const sample: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [106.7, 10.8] },
    },
  ],
};

export function MinimalMap() {
  const { addDataset, setMapId } = useMapDataset();

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
    void addDataset(
      createGeoJsonDataset({
        name: 'Sample points',
        geojson: sample,
        type: 'point',
        color: '#e74c3c',
      }),
    );
  }

  return (
    <Map onMapLoaded={onMapLoaded}>
      <LayerControl position="top-left" show />
    </Map>
  );
}
```

Entry (once):

```ts
import { installMapApp } from '@hungpvq/react-map';
import '@hungpvq/react-map/style.css';

installMapApp();
```

## Optional installs (feature peers)

Install only when you use the feature:

| Feature | Packages |
|---------|----------|
| Print / `exportFile` | `file-saver` |
| Legend expression eval | `@maplibre/maplibre-gl-style-spec` |
| CreateControl file formats | `shpjs`, `papaparse`, `@tmcw/togeojson`, `@xmldom/xmldom`, `jszip`, `topojson-client`, … — [Peers and bundle](./peers-and-bundle.md) |
| Off-main-thread GIS parse | Vite plugin `@hungpvq/map-dataset/vite` — [Worker](/map/dataset/worker) |
| Draw / edit | `@hungpvq/vue-map-draw` or `react-map-draw` + `@hungpvq/map-draw` — [Draw](/map/draw/) |
| Devtools panel | `@hungpvq/vue-map-devtools` or `react-map-devtools` — [Devtools](./devtools.md) |

## Defaults (single-app / single theme)

Out of the box:

- Theme: `scope: 'document'` (`html` + `prefers-color-scheme` when `auto`)
- Stores / platform accessors: process-wide (`globalThis`)

For independent multi-map chrome themes use `ThemeControl` / `applyMapTheme` with `scope: 'map'` — [Map store](./map-store.md#multi-map-caveats-apps-with-map-a--map-b).

## Troubleshooting (external)

| Symptom | Check |
|---------|--------|
| Unstyled UI | Import `@hungpvq/vue-map/style.css` (or `react-map`) once; or the full a-la-carte CSS set |
| Horizontal scrollbar in popups / layer detail | Import map + draggable `style.css` (packages self-contain `box-sizing: border-box`) — [CSS variables → Box model](./css-variables.md#box-model-box-sizing) |
| Empty layer menus / no style editor | Call `installMapApp` before mounting maps |
| Two MapLibre instances / broken GL | Only one `maplibre-gl` in the app (peer); avoid bundling a second copy |
| Peer warnings for turf / proj4 | Expected to come **with** `@hungpvq/map-core` — do not install `@turf/turf` for the library |
| CreateControl missing format | Install the optional GIS peer for that format |
| Types / exports missing | Import Stable symbols from documented packages — [Stable API](./stable-api.md) |

## Local consumers (`file:` dist)

To try a freshly built map stack without publishing, use sibling apps that point `file:` at `../vue-library/dist/libs/...` after `npm run map:build`. Guides: [Try local consumers](./try-local-consumers.md) · `g:\code\0-library\vue-3-test-map\TRY-LOCAL.md` · `g:\code\0-library\react-demo-map\TRY-LOCAL.md`.

## Next

- Full a-la-carte peer table: [Peers and bundle](./peers-and-bundle.md)
- Copy-paste map + layer only: [Minimal starter](./minimal-starter.md)
- Hub overview: [Getting started](../index.md)
- Local `file:` try: [Try local consumers](./try-local-consumers.md)
