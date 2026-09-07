# Map

Vue / React map libraries built on MapLibre GL.

## Packages

| Package | Description |
|---------|-------------|
| [`@hungpvq/vue-map-core`](./core/) / [`@hungpvq/react-map-core`](./core/) | Map container, controls, hooks |
| [`@hungpvq/vue-map-dataset`](./dataset/) / [`@hungpvq/react-map-dataset`](./dataset/) | Layers, identify, create dataset |
| [`@hungpvq/vue-map-draw`](./draw/) | Draw / edit geometries (**Vue only** for now) |

## Live demos

- [Vue](https://hung4564.github.io/demo-map/vue/)
- [React](https://hung4564.github.io/demo-map/react/)

## Versioning

- SemVer / breaking-change checklist: [../../README.md](../../README.md#checklist-semver--breaking-change)
- **Stable API allowlist:** [core/stable-api.md](./core/stable-api.md)

## Getting started in 5 minutes

### 1. Install

**Vue**

```bash
npm install @hungpvq/vue-map-core @hungpvq/vue-map-dataset @hungpvq/map-core @hungpvq/map-dataset
```

**React**

```bash
npm install @hungpvq/react-map-core @hungpvq/react-map-dataset @hungpvq/map-core @hungpvq/map-dataset
```

### 2. Import CSS (once)

```ts
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
```

```ts
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';
```

### 3. Register dataset UI

Without this step, layer menus / style / export / attribute table **do not render**.

```ts
// Vue
import { createDatasetRegistryPlugin } from '@hungpvq/vue-map-dataset';
app.use(createDatasetRegistryPlugin());
```

```ts
// React
import { createDatasetRegistryPlugin } from '@hungpvq/react-map-dataset';
createDatasetRegistryPlugin().install();
```

### 4. Mount map + LayerControl

See [Map Core](./core/) for the `Map` snippet and [Map Dataset](./dataset/) for adding a GeoJSON layer (`createGeoJsonDataset` + `useMapDataset`).

Minimal path: `Map` → `LayerControl` → on map load, `addDataset(createGeoJsonDataset({ ... }))`.

### 5. GIS worker (when parsing files / heavy geo)

Add the Vite plugin from `@hungpvq/map-dataset/vite` — details: [Worker](./dataset/worker).

## If UI / worker seems broken

| Symptom | Check |
|---------|--------|
| Unstyled / broken layout | Forgot `style.css` import |
| Empty layer menus, missing style / export / attribute UI | Forgot `createDatasetRegistryPlugin()` |
| Dialogs / management panels missing | Need `ComponentManagementControl` (or equivalent) on the map |
| File parse hangs / blocks UI; worker never runs | Vite `mapDatasetGisWorker()` / worker asset config — [Worker docs](./dataset/worker) |
| Install / peer errors | Align `@hungpvq/map-core` + dataset + vue/react peers; use documented import paths |

More detail: [Map Dataset setup](./dataset/) · [Map Core](./core/) · [Stable API](./core/stable-api.md)
