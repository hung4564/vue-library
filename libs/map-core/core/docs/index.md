# Map

Vue / React map libraries built on MapLibre GL.

## Packages

| Package | Description |
|---------|-------------|
| [`@hungpvq/vue-map-core`](./core/) / [`@hungpvq/react-map-core`](./core/) | Map container, controls, hooks |
| [`@hungpvq/vue-map-dataset`](./dataset/) / [`@hungpvq/react-map-dataset`](./dataset/) | Layers, identify, create dataset |
| [`@hungpvq/vue-map-draw`](/map/draw/) / [`@hungpvq/react-map-draw`](/map/draw/) | Draw / edit (Inspect documented under draw) |
| [`@hungpvq/vue-map-devtools`](./core/devtools) / [`@hungpvq/react-map-devtools`](./core/devtools) | Debug panel (store, logs, errors) |

Errors / `errorHandler`: [Error handling](./core/error-handling.md).  
Map access / scoped stores: [Map store](./core/map-store.md).  
Feature APIs (basemap, theme, …): import from `@hungpvq/map-core/<domain>` — [Stable API](./core/stable-api.md).

## Live demos

- [Vue](https://hung4564.github.io/demo-map/vue/)
- [React](https://hung4564.github.io/demo-map/react/)

## Versioning

- SemVer / breaking-change checklist: [libs/map-core/README.md](https://github.com/hung4564/vue-library/blob/main/libs/map-core/README.md#checklist-semver--breaking-change)
- **Stable API allowlist:** [core/stable-api.md](./core/stable-api.md)
- **Map store / `getMap`:** [core/map-store.md](./core/map-store.md)
- **Error handling:** [core/error-handling.md](./core/error-handling.md)

## Getting started in 5 minutes

Prefer the focused walkthrough: **[Minimal starter](./core/minimal-starter.md)** (Map + one GeoJSON, no GIS worker). Peers: [Peers and bundle](./core/peers-and-bundle.md).

### 1. Install

**Vue**

```bash
npm install @hungpvq/vue-map-core @hungpvq/vue-map-dataset @hungpvq/map-core @hungpvq/map-dataset maplibre-gl
```

**React**

```bash
npm install @hungpvq/react-map-core @hungpvq/react-map-dataset @hungpvq/map-core @hungpvq/map-dataset maplibre-gl
```

Draw / edit is optional — add `@hungpvq/vue-map-draw` / `@hungpvq/react-map-draw` + `@hungpvq/map-draw` when you need [Draw](/map/draw/).

### 2. Import CSS (once)

```ts
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
```

```ts
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';
```

### 3. Bootstrap once (`installMapApp`)

Theme + dataset registry UI. Without this step, layer menus / style / export / attribute table **do not render**.

```ts
// Vue
import { installMapApp } from '@hungpvq/vue-map-dataset';
// or app.use(createMapAppPlugin())
installMapApp(app);
```

```ts
// React
import { installMapApp } from '@hungpvq/react-map-dataset';
installMapApp();
```

Prefer `installMapApp` over calling `createDatasetRegistryPlugin()` alone (registry-only / no theme). Full walkthrough: [Minimal starter](./core/minimal-starter.md).

### 4. Mount map + LayerControl

See [Map Core](./core/) for the `Map` snippet and [Map Dataset](./dataset/) for adding a GeoJSON layer (`createGeoJsonDataset` + `useMapDataset`).

Minimal path: `Map` → `LayerControl` → on map load, `addDataset(createGeoJsonDataset({ ... }))`. Full copy-paste: [Minimal starter](./core/minimal-starter.md).

### 5. GIS worker (when parsing files / heavy geo)

Not needed for the minimal inline-GeoJSON path. Add the Vite plugin from `@hungpvq/map-dataset/vite` when uploading / parsing files — details: [Worker](./dataset/worker).

## If UI / worker seems broken

| Symptom | Check |
|---------|--------|
| Unstyled / broken layout | Forgot `style.css` import |
| Empty layer menus, missing style / export / attribute UI | Forgot `installMapApp` (or `createDatasetRegistryPlugin`) |
| Dialogs / management panels missing | Need `ComponentManagementControl` (or equivalent) on the map |
| File parse hangs / blocks UI; worker never runs | Vite `mapDatasetGisWorker()` / worker asset config — [Worker docs](./dataset/worker) |
| CreateControl fails on CSV/KML/Shapefile with missing peer | Install optional GIS peers — [CreateControl](./dataset/module/CreateControl) |
| Install / peer errors | Align `@hungpvq/map-core` + dataset + vue/react peers; use documented import paths |

More detail: [Map Dataset setup](./dataset/) · [Map Core](./core/) · [Stable API](./core/stable-api.md)

## E2E smoke

```bash
npm run map:e2e
```

Playwright hits Vue `/#/minimal/` and React `/#/minimal` (`apps/vue/demo-map-e2e`, `apps/react/demo-map-e2e`).
