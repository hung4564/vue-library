# GeoJSON worker

[`CreateControl`](./module/CreateControl.md) parses GeoJSON and reprojects CRS **off the main thread** using a Web Worker. You do not start the worker yourself — it is created the first time a file is read, text is pasted, or a layer is created with a CRS other than EPSG:4326.

If the worker cannot start, the same work still runs on the main thread (large files can freeze the UI). Configure your bundler so the worker actually loads.

## What runs in the worker

- Read `.geojson` / `.json` files
- `JSON.parse` and CRS detection (EPSG from the GeoJSON, if present)
- Reproject to WGS84 when creating a layer (`proj4`)

## Vite

The worker is created with:

```ts
new Worker(new URL('./geojson.worker.ts', import.meta.url), { type: 'module' });
```

Vite must emit it as an ES module worker.

### Plain Vite app

```ts
import { defineConfig } from 'vite';

export default defineConfig({
  worker: {
    format: 'es',
  },
});
```

### Nx / TypeScript path aliases

Vite workers **do not inherit** `plugins` from the main config. If you use `@nx/vite` path aliases (`nxViteTsPaths`), add them to `worker.plugins`:

```ts
import { defineConfig } from 'vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import vue from '@vitejs/plugin-vue'; // or @vitejs/plugin-react

export default defineConfig({
  plugins: [vue(), nxViteTsPaths()],
  worker: {
    plugins: () => [nxViteTsPaths()],
    format: 'es',
  },
});
```

Without this, `dev` / `build` can fail with:

```text
[vite:worker-import-meta-url] Rollup failed to resolve import "@hungpvq/map-core"
```

or the worker fails silently and parsing falls back to the main thread.

Reference configs: `apps/vue/demo-map/vite.config.ts`, `apps/react/demo-map/vite.config.ts`.

### Webpack 5

Webpack 5 supports `new Worker(new URL(..., import.meta.url), { type: 'module' })`. If module workers are disabled, the library falls back to the main thread.

## Call the APIs yourself

Re-exported from `@hungpvq/map-dataset` (and the Vue / React packages):

```ts
import {
  loadGeojsonFileAsync,
  loadGeojsonTextAsync,
  reprojectGeojsonToWgs84Async,
  terminateGeojsonWorker,
} from '@hungpvq/map-dataset';

const { geojson, crs } = await loadGeojsonFileAsync(file);
const wgs84 = await reprojectGeojsonToWgs84Async(geojson!, crs);
```

| Function | Role |
| --- | --- |
| `loadGeojsonFileAsync(file)` | Read a `File` / `Blob`, parse, detect CRS |
| `loadGeojsonTextAsync(text)` | Parse pasted text, detect CRS |
| `parseGeojsonTextAsync(text)` | Same parse; returns GeoJSON only |
| `reprojectGeojsonToWgs84Async(geojson, crs)` | Reproject to EPSG:4326 (no-op if already 4326) |
| `terminateGeojsonWorker()` | Optional cleanup (tests / HMR) |

## Vue: do not make GeoJSON reactive

`postMessage` cannot clone Vue Proxies. Store GeoJSON with `markRaw` on form state, and avoid spreading the whole GeoJSON object when you only change CRS.

```ts
import { markRaw } from 'vue';

form.geojson = markRaw(geojson);
```

## This repo (library / workspace)

Worker source must import map-core **relatively**, not `@hungpvq/map-core`. Vite workers cannot resolve workspace package names and would leave them external.

Do **not** enable `worker.plugins` on `@hungpvq/vue-map-dataset`’s Vite config (Vue SFC parse error). Keep `@hungpvq/map-dataset` external there so the wrapper does not rebundle the worker.
