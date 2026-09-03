# GIS worker

[`CreateControl`](./module/CreateControl.md) reads GIS files, parses them to GeoJSON, and reprojects CRS **off the main thread** using a Web Worker. You do not start the worker yourself — it is created the first time a file is read, text is pasted, a sample URL is fetched, a layer is created with a CRS other than EPSG:4326, or bbox / auto-style work runs.

If the worker cannot start, the same work still runs on the main thread (large files can freeze the UI). Configure your bundler so the worker actually loads.

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

The client registers with `WorkerMonitor` as `geojson`. Progress and **worker logs** (`read` / `parse` / `fetch` / `reproject`, plus `console.*` inside the worker) show up on `WorkerControl`.

## Vue: do not make GeoJSON reactive

`postMessage` cannot clone Vue Proxies. Store GeoJSON with `markRaw` on form state, and avoid spreading the whole GeoJSON object when you only change CRS.

```ts
import { markRaw } from 'vue';

form.geojson = markRaw(geojson);
```

## This repo (library / workspace)

Worker source must import map-core **relatively**, not `@hungpvq/map-core`. Vite workers cannot resolve workspace package names and would leave them external.

Do **not** enable `worker.plugins` on `@hungpvq/vue-map-dataset`’s Vite config (Vue SFC parse error). Keep `@hungpvq/map-dataset` external there so the wrapper does not rebundle the worker.
