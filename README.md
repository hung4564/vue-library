# VueLibrary

> A monorepo of MapLibre map libraries, draggable layouts, UI components, and logging utilities for Vue 3 and React

## 🚀 Introduction

VueLibrary is an Nx + TypeScript monorepo publishing `@hungpvq/*` packages. Dual Vue 3 and React adapters sit on framework-agnostic cores:

- **Interactive maps** with MapLibre GL (`map-core`, `map-dataset`, `map-draw`, `map-devtools`, `map`)
- **Drag and drop layouts** with Vue / React adapters (`draggable`)
- **Generic UI components** with zero internal dependencies (`ui-core`)
- **Logging & Devtools infrastructure** with live hook tracking (`shared-log`)
- **Shared utilities & state management** used across packages (`shared-store`, `shared`, `shared-core`, `shared-file`)

## 📦 Main Libraries

Libraries in this monorepo are structured by functional domain under `libs/<domain>/{core,vue,react,docs}`:

### 🗺️ Map Libraries

Framework-agnostic cores:

- **[@hungpvq/map-core](./libs/map-core/core/)** — Engine helpers, store, theme, locale, registry, workers
- **[@hungpvq/map-dataset](./libs/map-dataset/core/)** — Dataset tree, builders, identify, style, GIS worker
- **[@hungpvq/map-draw](./libs/map-draw/core/)** — DrawService, DrawingType, styles, shared `InspectController`
- **[@hungpvq/map-debug](./libs/map-devtools/core/)** — Map debug host bridge, store helpers, shared styles

Vue / React adapters (UI and hooks only — **do not** re-export core):

- **[@hungpvq/vue-map-core](./libs/map-core/vue/)** / **[@hungpvq/react-map-core](./libs/map-core/react/)** — Map container, controls (basemap, measurement, print, legend, …), hooks (`useMap`, `useMapState`, …)
- **[@hungpvq/vue-map-dataset](./libs/map-dataset/vue/)** / **[@hungpvq/react-map-dataset](./libs/map-dataset/react/)** — Dataset UI, hooks, registry plugin
- **[@hungpvq/vue-map-draw](./libs/map-draw/vue/)** / **[@hungpvq/react-map-draw](./libs/map-draw/react/)** — Draw / edit UI; `InspectControl` parity (shared `InspectController`)
- **[@hungpvq/vue-map-devtools](./libs/map-devtools/vue/)** / **[@hungpvq/react-map-devtools](./libs/map-devtools/react/)** — Debug panel (store, logs, errors)
- **[@hungpvq/vue-map](./libs/map/vue/)** / **[@hungpvq/react-map](./libs/map/react/)** — Meta packages grouping all map adapters

**Import guidance:** import protocol/types/services (`getMap`, `errorHandler`, builders, `DrawService`, …) from `@hungpvq/map-core` / `map-dataset` / `map-draw`; import UI and hooks from the matching `vue-*` / `react-*` package.

**Docs hubs:** [Map Core docs](./libs/map-core/docs/index.md) · [Map Dataset docs](./libs/map-dataset/docs/index.md) · [Map Draw docs](./libs/map-draw/docs/index.md) · **Stable API:** [stable-api.md](./libs/map-core/docs/core/stable-api.md) · **Map store:** [map-store.md](./libs/map-core/docs/core/map-store.md) · **Devtools:** [devtools.md](./libs/map-core/docs/core/devtools.md)

---

### 🎯 Draggable Libraries

- **[@hungpvq/draggable](./libs/draggable/core/)** — Types, store (`drag:core`), utils, shared CSS
- **[@hungpvq/vue-draggable](./libs/draggable/vue/)** — Vue container, items, hooks
- **[@hungpvq/react-draggable](./libs/draggable/react/)** — React container, items, hooks

**Docs hub:** [libs/draggable/docs/index.md](./libs/draggable/docs/index.md) · **SemVer checklist:** [libs/draggable/README.md](./libs/draggable/README.md)

---

### 🎨 UI Core Libraries

Framework-level UI primitives with **zero** dependencies on other workspace libraries:

- **[@hungpvq/vue-ui-core](./libs/ui-core/vue/)** — Vue 3 buttons, inputs, tabs, lists, tree items, form fields
- **[@hungpvq/react-ui-core](./libs/ui-core/react/)** — React 18 buttons, inputs, tabs, lists, tree items, form fields

Controls include: `BaseButton`, `CopyButton`, `Icon`, `Tabs`, `List`, `ListItem`, `TreeItem`, `Collapse`, and form fields (`InputText`, `InputSelect`, `InputCheckbox`, `InputSlider`, `DragDropFile`).

---

### 🪵 Shared Log & Devtools

Universal logging envelope (`{ id, header, data }`), live hook inspector, and devtools shell:

- **[@hungpvq/shared-log](./libs/shared-log/core/)** — Vanilla JS core logger, stores (IndexedDB/memory), ambient zone context, debug host
- **[@hungpvq/vue-shared-log](./libs/shared-log/vue/)** — Vue Devtools shell, built-in tabs (Store, Live, Logs, Errors), `useLiveHookDebug`
- **[@hungpvq/react-shared-log](./libs/shared-log/react/)** — React Devtools shell, built-in tabs, `useLiveHookDebug`, `LiveHookScope`

**Docs hub:** [libs/shared-log/docs/index.md](./libs/shared-log/docs/index.md) · [Overview](./libs/shared-log/README.md)

---

### 🔧 Shared Utilities

- **[@hungpvq/shared-store](./libs/share/store/)** — Process-wide reactive store service
- **[@hungpvq/shared](./libs/share/shared/)** — General shared utilities
- **[@hungpvq/shared-core](./libs/share/core/)** — Core shared helpers
- **[@hungpvq/shared-file](./libs/share/file/)** — File reading, writing, and parsing utilities

---

## 🛠️ Installation

### Install the entire project (development)

```bash
# Clone repository
git clone https://github.com/hung4564/vue-library.git
cd vue-library

# Install dependencies
npm install

# Build all libraries
npm run build
```

### Install individual packages (production)

```bash
# Map cores + Vue adapters
npm install @hungpvq/map-core @hungpvq/map-dataset @hungpvq/map-draw
npm install @hungpvq/vue-map-core @hungpvq/vue-map-dataset @hungpvq/vue-map-draw

# Or React map adapters
npm install @hungpvq/react-map-core @hungpvq/react-map-dataset @hungpvq/react-map-draw

# Draggable
npm install @hungpvq/draggable @hungpvq/vue-draggable
# npm install @hungpvq/react-draggable

# UI Core
npm install @hungpvq/vue-ui-core
# npm install @hungpvq/react-ui-core

# Shared Log & Devtools
npm install @hungpvq/shared-log @hungpvq/vue-shared-log
# npm install @hungpvq/react-shared-log

# Shared Utilities
npm install @hungpvq/shared-store @hungpvq/shared @hungpvq/shared-core @hungpvq/shared-file
```

---

## 🚀 Quick Start

Call `installMapApp` once (theme + dataset registry), import CSS, then mount `Map` + `LayerControl`. Full walkthrough: [Minimal starter](./libs/map-core/docs/core/minimal-starter.md).

### Vue — Map + GeoJSON layer

```ts
// main.ts
import { createApp } from 'vue';
import { createStoreRegistryPlugin } from '@hungpvq/shared-store';
import { installMapApp } from '@hungpvq/vue-map-dataset';
import App from './App.vue';

const app = createApp(App);
app.use(createStoreRegistryPlugin());
installMapApp(app);
app.mount('#app');
```

```vue
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { Map, BaseMapControl, MeasurementControl, PrintControl } from '@hungpvq/vue-map-core';
import { LayerControl, useMapDataset } from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset/geojson';
import type { FeatureCollection } from 'geojson';
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';

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
    <LayerControl
      position="top-left"
      show
    />
    <BaseMapControl position="bottom-left" />
    <MeasurementControl position="top-right" />
    <PrintControl />
  </Map>
</template>
```

---

## 📚 Documentation

- **[VitePress Docs Site](./docs/)** — Unified portal (`npm run docs:dev`)
- **[Map Core Docs Hub](./libs/map-core/docs/index.md)** — Getting started, Stable API, minimal starter
- **[Map Dataset Docs](./libs/map-dataset/docs/index.md)** — Datasets, layers, styles, identify
- **[Map Draw Docs](./libs/map-draw/docs/index.md)** — Draw service, shapes, inspect
- **[Draggable Docs](./libs/draggable/docs/index.md)** — Layouts, drag-and-drop, containers
- **[Shared Log Docs](./libs/shared-log/docs/index.md)** — Logging API, Live hook tracking, Devtools shell
- **Live demos:** [Vue map](https://hung4564.github.io/demo-map/vue/) · [React map](https://hung4564.github.io/demo-map/react/) · [Vue draggable](https://hung4564.github.io/demo-draggable/vue/) · [React draggable](https://hung4564.github.io/demo-draggable/react/)
- **Local demo apps:** `apps/vue/demo-map`, `apps/react/demo-map`, `apps/vue/demo-draggable`, `apps/react/demo-draggable`

---

## 🏗️ Development

### Available Scripts

| Domain              | Build                        | Test                      | Release                        |
| :------------------ | :--------------------------- | :------------------------ | :----------------------------- |
| **Map**             | `npm run map:build`          | `npm run map:test`        | `npm run map:release`          |
| **Draggable**       | `npm run draggable:build`    | `npm run draggable:test`  | `npm run draggable:release`    |
| **UI Core**         | `npm run ui-core:build`      | `npm run ui-core:test`    | `npm run ui-core:release`      |
| **Shared Log**      | `npm run shared-log:build`   | `npm run shared-log:test` | `npm run shared-log:release`   |
| **Shared Store**    | `npm run shared-store:build` | —                         | `npm run shared-store:release` |
| **All / Workspace** | `npm run build`              | `npm run lint`            | `npm run release-publish`      |

Additional commands:

```bash
# Demo apps
npm run map:dev-vue           # nx serve vue-demo-map
npm run map:dev-react         # nx serve react-demo-map
npm run draggable:dev-vue     # nx serve demo-draggable
npm run draggable:dev-react   # nx serve react-demo-draggable

# Docs site
npm run docs:dev              # link docs + start VitePress
npm run docs:build            # build VitePress documentation

# Peer synchronization
npm run map:peers:sync
npm run draggable:peers:sync
npm run ui-core:peers:sync
npm run shared-log:peers:sync
npm run shared-store:peers:sync
```

### Project Structure

```
vue-library/
├── apps/                         # Demo applications
│   ├── vue/                      # vue-demo-map, demo-draggable
│   └── react/                    # react-demo-map, react-demo-draggable
├── docs/                         # VitePress unified docs portal
├── libs/                         # Domain-organized libraries
│   ├── map-core/                 # core, vue, react, docs
│   ├── map-dataset/              # core, vue, react, docs
│   ├── map-draw/                 # core, vue, react, docs
│   ├── map-devtools/             # core (map-debug), vue, react
│   ├── map/                      # vue (meta), react (meta)
│   ├── draggable/                # core, vue, react, docs
│   ├── ui-core/                  # vue, react
│   ├── shared-log/               # core, vue, react, docs
│   ├── share/                    # store, shared, core, file
│   └── demo/                     # demo-map-datasets (private fixtures)
├── scripts/                      # Release automation, doc linking, submodule deployment
└── deploy/                       # Submodules for GitHub Pages deployment
```

---

## 👨‍💻 Author

**hung.pv** - [GitHub](https://github.com/hung4564)

---

## 📞 Contact

- **Issues**: [GitHub Issues](https://github.com/hung4564/vue-library/issues)
- **Repository**: [GitHub Repository](https://github.com/hung4564/vue-library)
