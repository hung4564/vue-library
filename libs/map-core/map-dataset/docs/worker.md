# GIS worker

[`CreateControl`](./module/CreateControl.md) reads GIS files, parses them to GeoJSON, and reprojects CRS **off the main thread** using a Web Worker. You do not start the worker yourself — it starts the first time a file is read, text is pasted, a sample URL is fetched, a layer is created with a CRS other than EPSG:4326, or bbox / auto-style work runs.

If the worker cannot start, the same work still runs on the main thread (large files can freeze the UI). Configure the app so the worker file is actually reachable.

Mount [`WorkerControl`](/map/core/module/WorkerControl) to watch status, progress, and errors for this worker (`id: geojson`, name **GIS**) and any other worker registered with `WorkerMonitor`. See [Worker monitor](/map/core/extra-worker).

## Formats

| Input | Notes |
| --- | --- |
| GeoJSON `.geojson` / `.json` | CRS from `crs.properties.name` when present |
| GeoJSON Lines `.geojsonl` / `.ndjson` | One Feature per line |
| TopoJSON `.topojson` | Converted with `topojson-client` |
| KML `.kml` | Converted with `@tmcw/togeojson` |
| KMZ `.kmz` | Zip archive containing a KML |
| GPX `.gpx` | Tracks / routes / waypoints |
| ZIP `.zip` | Shapefile (`.shp`+`.dbf`+`.prj`) **or** GeoJSON / KML / GPX / TopoJSON / CSV / WKT members (merged when several) |
| Shapefile parts `.shp` / `.dbf` / `.prj` | Drop the sidecar files together |
| CSV `.csv` | `lat`/`lon` (or aliases) **or** a WKT/`geometry` column |
| WKT `.wkt` | `POINT`, `LINESTRING`, `POLYGON`, and Multi* |

Pasted text can be GeoJSON, TopoJSON, KML, GPX, CSV, or WKT.

## What runs in the worker

- Fetch sample / remote GIS URLs
- Read files (`File.arrayBuffer` / `text`)
- Parse + convert to GeoJSON
- Detect EPSG when the source includes it
- Reproject to WGS84 when creating a layer (`proj4`)
- Turf **bbox** when creating a layer (always prefers worker)
- Auto style-type detection when FeatureCollection is large (≥ ~2000 features)

## Setup (pick your app type)

### A. App installs the published package (npm) — e.g. `vue-3-test-map`

The published `@hungpvq/map-dataset` builds the worker to:

```text
node_modules/@hungpvq/map-dataset/assets/geojson.worker-<hash>.js
```

and creates it with an **absolute** URL:

```ts
new Worker(new URL('/assets/geojson.worker-<hash>.js', import.meta.url), {
  type: 'module',
});
```

The browser therefore requests `http://localhost:<port>/assets/geojson.worker-<hash>.js`.  
That file is **not** copied automatically — do **not** copy it by hand into `public/`. Use the Vite plugin instead.

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { mapDatasetGisWorker } from '@hungpvq/map-dataset/vite';

export default defineConfig({
  plugins: [
    vue(),
    // Syncs package assets → public/assets on every Vite start / build
    mapDatasetGisWorker(),
  ],
});
```

After `npm run dev` / `npm run build`, you should see:

```text
public/assets/geojson.worker-<hash>.js
```

Vite serves `public/` at the site root, so `/assets/…` resolves. When you upgrade `@hungpvq/map-dataset`, the plugin replaces the old hashed file — no manual cleanup.

**Without the plugin**, CreateControl falls back to the main thread (or 404s the worker). Copying into `public/assets` by hand works once, then breaks on the next package version when the hash changes.

React / Vue UI packages both depend on `@hungpvq/map-dataset` — one plugin on the app Vite config is enough.

### B. App in this Nx monorepo (source / path aliases)

When Vite resolves workspace TypeScript (not the published `dist`), configure the **worker** bundler. Workers do **not** inherit main `plugins`:

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

Without `worker.plugins`, you may see:

```text
[vite:worker-import-meta-url] Rollup failed to resolve import "@hungpvq/map-core"
```

or the worker fails silently and parsing falls back to the main thread.

Reference configs: `apps/vue/demo-map/vite.config.ts`, `apps/react/demo-map/vite.config.ts`.

Do **not** use `mapDatasetGisWorker()` here — the monorepo builds the worker from source via `new URL('./geojson.worker.ts', import.meta.url)`.

### Webpack 5

Webpack 5 supports `new Worker(new URL(..., import.meta.url), { type: 'module' })`. If module workers are disabled, the library falls back to the main thread. For a published npm install, still expose the hashed file at `/assets/geojson.worker-….js` (copy from `node_modules/@hungpvq/map-dataset/assets/` into your static output).

## Call the APIs yourself

Re-exported from `@hungpvq/map-dataset` (and the Vue / React packages):

```ts
import {
  GIS_FILE_ACCEPT,
  loadGisFileAsync,
  loadGisTextAsync,
  loadGisUrlAsync,
  reprojectGeojsonToWgs84Async,
  terminateGeojsonWorker,
} from '@hungpvq/map-dataset';

const { geojson, crs, format } = await loadGisFileAsync(file);
const wgs84 = await reprojectGeojsonToWgs84Async(geojson!, crs);
```

`loadGeojsonFileAsync` / `loadGeojsonTextAsync` remain as aliases.

| Function | Role |
| --- | --- |
| `loadGisFileAsync(file \| files)` | Read one file, a Shapefile sidecar set, parse, detect CRS |
| `loadGisTextAsync(text)` | Parse pasted GIS text, detect CRS |
| `loadGisUrlAsync(url)` | Fetch in the worker, then parse |
| `parseGeojsonTextAsync(text)` | Same parse; returns GeoJSON only |
| `reprojectGeojsonToWgs84Async(geojson, crs)` | Reproject to EPSG:4326 (no-op if already 4326) |
| `bboxFromGeojsonAsync(geojson)` | Turf bbox (prefers worker) |
| `detectGeojsonStyleTypesAsync(geojson)` | Style types; worker when file is large |
| `terminateGeojsonWorker()` | Optional cleanup (tests / HMR) |

The client registers with `WorkerMonitor.connect` as `geojson`. Progress and logs show on `WorkerControl`: **task-scoped** lines (`ctx.log` / `taskId`) appear under the running task, then flush into the **Worker log** when the task finishes. Worker-level `console.*` (no `taskId`) go straight to the Worker log.

## Vue: do not make GeoJSON reactive

`postMessage` cannot clone Vue Proxies. Store GeoJSON with `markRaw` on form state, and avoid spreading the whole GeoJSON object when you only change CRS.

```ts
import { markRaw } from 'vue';

form.geojson = markRaw(geojson);
```

## This repo (library / workspace)

Worker source must import map-core utilities **relatively**, not `@hungpvq/map-core`. Vite workers cannot resolve workspace package names and would leave them external.

Do **not** enable `worker.plugins` on `@hungpvq/vue-map-dataset`’s Vite config (Vue SFC parse error). Keep `@hungpvq/map-dataset` external there so the wrapper does not rebundle the worker.

The Vite helper for consumer apps is exported as `@hungpvq/map-dataset/vite` (`mapDatasetGisWorker`).
