# VueLibrary

> A monorepo of MapLibre map libraries and UI components for Vue 3 and React

## 🚀 Introduction

VueLibrary is an Nx + TypeScript monorepo publishing `@hungpvq/*` packages for interactive maps, draggable layouts, and shared utilities. Dual Vue and React adapters sit on framework-agnostic cores:

- **Interactive maps** with MapLibre GL (`map-core`, `map-dataset`, `map-draw`)
- **Drag and drop layouts** with Vue / React adapters
- **Dataset management** and visualization
- **Shared utilities** used across packages

## 📦 Main Libraries

### 🗺️ Map Libraries

Framework-agnostic cores:

- **[@hungpvq/map-core](./libs/map-core/core/)** — Engine helpers, store, theme, locale, registry, workers
- **[@hungpvq/map-dataset](./libs/map-core/map-dataset/)** — Dataset tree, builders, identify, style, GIS worker
- **[@hungpvq/map-draw](./libs/map-core/map-draw/)** — DrawService, DrawingType, styles, shared `InspectController`

Vue / React adapters (UI and hooks only — **do not** re-export core):

- **[@hungpvq/vue-map-core](./libs/vue/map-core/)** / **[@hungpvq/react-map-core](./libs/react/map-core/)** — Map container, controls (basemap, measurement, print, legend, …), hooks (`useMapGlobalStore`, …)
- **[@hungpvq/vue-map-dataset](./libs/vue/map-dataset/)** / **[@hungpvq/react-map-dataset](./libs/react/map-dataset/)** — Dataset UI, hooks, registry plugin
- **[@hungpvq/vue-map-draw](./libs/vue/map-draw/)** / **[@hungpvq/react-map-draw](./libs/react/map-draw/)** — Draw / edit UI; `InspectControl` is **parity** (shared `InspectController`: style + popup/hover)
- **[@hungpvq/vue-map-devtools](./libs/vue/map-devtools/)** / **[@hungpvq/react-map-devtools](./libs/react/map-devtools/)** — Debug panel (store, logs, errors)

**Import guidance:** import protocol/types/services (`getMap`, `errorHandler`, builders, `DrawService`, …) from `@hungpvq/map-core` / `map-dataset` / `map-draw`; import UI and hooks from the matching `vue-*` / `react-*` package.

**Docs hub:** [libs/map-core/core/docs/index.md](./libs/map-core/core/docs/index.md) · **Stable API:** [stable-api.md](./libs/map-core/core/docs/core/stable-api.md) · **Map store:** [map-store.md](./libs/map-core/core/docs/core/map-store.md) · **Error handling:** [error-handling.md](./libs/map-core/core/docs/core/error-handling.md) · **Devtools:** [devtools.md](./libs/map-core/core/docs/core/devtools.md) · **SemVer checklist:** [libs/map-core/README.md](./libs/map-core/README.md)

### 🎯 Draggable Libraries

- **[@hungpvq/draggable](./libs/draggable/core/)** — Types, store (`drag:core`), utils, shared CSS
- **[@hungpvq/vue-draggable](./libs/vue/draggable/)** — Vue container, items, hooks
- **[@hungpvq/react-draggable](./libs/react/draggable/)** — React container, items, hooks

**Docs hub:** [libs/draggable/core/docs/index.md](./libs/draggable/core/docs/index.md) · **SemVer checklist:** [libs/draggable/README.md](./libs/draggable/README.md)

### 🔧 Shared Libraries

- **[@hungpvq/shared](./libs/share/shared/)** — Shared utilities
- **[@hungpvq/shared-core](./libs/share/core/)** — Core shared functions
- **[@hungpvq/shared-file](./libs/share/file/)** — File utilities
- **[@hungpvq/shared-store](./libs/share/store/)** — Store utilities
- **[@hungpvq/shared-log](./libs/share/log/)** — Logging utilities

## 🛠️ Installation

### Install the entire project

```bash
# Clone repository
git clone https://github.com/hung4564/vue-library.git
cd vue-library

# Install dependencies
npm install

# Build all libraries
npm run build
```

### Install individual libraries

```bash
# Map cores + Vue adapters
npm install @hungpvq/map-core @hungpvq/map-dataset @hungpvq/map-draw
npm install @hungpvq/vue-map-core @hungpvq/vue-map-dataset @hungpvq/vue-map-draw

# Or React adapters
npm install @hungpvq/react-map-core @hungpvq/react-map-dataset @hungpvq/react-map-draw

# Optional map debug panel
npm install @hungpvq/vue-map-devtools
# npm install @hungpvq/react-map-devtools

# Draggable
npm install @hungpvq/draggable @hungpvq/vue-draggable
# npm install @hungpvq/react-draggable

# Shared libraries
npm install @hungpvq/shared @hungpvq/shared-core @hungpvq/shared-file @hungpvq/shared-store @hungpvq/shared-log
```

## 🚀 Quick Start

Register dataset UI once (`createDatasetRegistryPlugin()`), import CSS, then mount `Map` + `LayerControl`. Full walkthrough: [Minimal starter](./libs/map-core/core/docs/core/minimal-starter.md).

### Vue — Map + GeoJSON layer

```vue
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { Map, BaseMapControl, MeasurementControl, PrintControl } from '@hungpvq/vue-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/vue-map-dataset';
import { DrawControl } from '@hungpvq/vue-map-draw';
import { createGeoJsonDataset } from '@hungpvq/map-dataset';
import type { FeatureCollection } from 'geojson';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';

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
  <Map @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show />
    <BaseMapControl position="bottom-left" />
    <DrawControl position="top-right" />
    <MeasurementControl position="top-right" />
    <PrintControl />
  </Map>
</template>
```

Dataset setup: [vue-map-dataset docs](./libs/vue/map-dataset/docs/index.md) (also linked from the [map docs hub](./libs/map-core/core/docs/index.md)).

### Devtools (optional)

- **Vue:** `app.use(DevtoolsPlugin)` from `@hungpvq/vue-map-devtools` (global `Devtools` and/or `<Devtools />`)
- **React:** `installDevtools()` then mount `<Devtools />` from `@hungpvq/react-map-devtools`

Details: [devtools.md](./libs/map-core/core/docs/core/devtools.md).

## 📚 Documentation

- **[Map docs hub](./libs/map-core/core/docs/index.md)** — Getting started, Stable API, minimal starter
- **[VitePress docs](./docs/)** — Linked package docs site (`npm run docs:dev`)
- **Live demos:** [Vue map](https://hung4564.github.io/demo-map/vue/) · [React map](https://hung4564.github.io/demo-map/react/) · [Vue draggable](https://hung4564.github.io/demo-draggable/vue/) · [React draggable](https://hung4564.github.io/demo-draggable/react/)
- **Local demos:** `apps/vue/demo-map`, `apps/react/demo-map`, `apps/vue/demo-draggable`, `apps/react/demo-draggable`

## 🏗️ Development

### Available Scripts

```bash
# Map
npm run map:lint          # lint + typecheck tagged map (exclude demo)
npm run map:build         # lint + build map libs
npm run map:test          # vitest tagged map (excl. demo)
npm run map:dev-vue       # nx serve vue-demo-map
npm run map:dev-react     # nx serve react-demo-map
npm run map:site:dev      # link docs + VitePress demo-map
npm run map:release       # nx release --group=map

# Draggable
npm run draggable:build
npm run draggable:test
npm run draggable:dev-vue
npm run draggable:dev-react

# Share / docs / workspace
npm run share:build
npm run docs:dev          # VitePress docs/
npm run build             # lint + build all
npm run lint
npm run ts-check
```

### Project Structure

```
vue-library/
├── apps/                      # Demo applications (vue / react)
├── docs/                      # VitePress docs site
├── libs/
│   ├── map-core/              # @hungpvq/map-core, map-dataset, map-draw
│   ├── vue/                   # vue-map-*, vue-draggable
│   ├── react/                 # react-map-*, react-draggable
│   ├── draggable/             # @hungpvq/draggable
│   └── share/                 # shared utilities
```

## 👨‍💻 Author

**hung.pv** - [GitHub](https://github.com/hung4564)

---

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/hung4564/vue-library/issues)
- **Repository**: [GitHub Repository](https://github.com/hung4564/vue-library)

## Idea

- [x] Introduce a new `dataset` type: **`data-management`**
  - This dataset type supports **CRUD operations** (create, read, update, delete).

- [ ] Provide templates for `data-management` datasets:
  - [ ] **Local template** – handles local data sources in:
    - [x] **GeoJSON format**, or
    - [ ] **List-based format** (which may or may not be convertible to GeoJSON).
  - [ ] **API template** – handles data through remote APIs, supporting responses in:
    - [x] **GeoJSON format**, or
    - [ ] **List-based format** (which may or may not be convertible to GeoJSON).

- [ ] Extend **DrawControl**
  - [] with a **Draft mechanism**:
    - [x] Enables temporary drawing and editing before committing changes.
    - [x] Allows **external customization** to adapt Draft behavior to different workflows or integrations.
  - [ ] support default draw
    - draw normal
    - download
