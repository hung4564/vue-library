# GIS worker

[`CreateControl`](./module/CreateControl.md) reads GIS files, parses them to GeoJSON, and reprojects CRS **off the main thread** using a Web Worker. You do not start the worker yourself — it starts the first time a file is read, text is pasted, a sample URL is fetched, a layer is created with a CRS other than EPSG:4326, or bbox / auto-style work runs.

**Not required** for [Minimal starter](/map/core/minimal-starter) (inline FeatureCollection / in-memory GeoJSON via `createGeoJsonDataset`). Use this worker when uploading or parsing files / heavy geo.

If the worker cannot start, the same work still runs on the main thread (large files can freeze the UI). Configure the app so the worker file is actually reachable.

Mount [`WorkerControl`](/map/core/module/WorkerControl) to watch status, progress, and errors for this worker (`id: geojson`, name **GIS**) and any other worker registered with `WorkerMonitor`. See [Worker monitor](/map/core/extra-worker).

**Cancel:** from WorkerControl (or `WorkerMonitor.abortTask` / `abortWorkerMonitorTask`), the client posts an abort envelope; the GIS worker checks `ctx.throwIfAborted()` between progress steps. Unknown abort messages are ignored by older workers (backward compatible).

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
| FileGDB `.gdb.zip` / `*_gdb.zip` / `.gdb` folder | Optional peer `gdal3.js` (+ `jszip`). **Main thread only** (UMD via CDN classic `<script>` — never Vite-`import('gdal3.js')`, never inside this GIS worker). |

Pasted text can be GeoJSON, TopoJSON, KML, GPX, CSV, or WKT.

**Optional peers** (install in the app when using CreateControl / GIS file import):

```bash
npm i shpjs papaparse jszip topojson-client @tmcw/togeojson @xmldom/xmldom
# FileGDB only:
npm i gdal3.js
```

- Sync `parseGisText` handles GeoJSON / GeoJSONL / WKT only.
- CSV / KML / GPX / TopoJSON / ZIP / Shapefile / FileGDB need `parseGisTextAsync` / `loadGis*Async` (dynamic import of the peers above).

## What runs in the worker

- Fetch sample / remote GIS URLs
- Read files (`File.arrayBuffer` / `text`)
- Parse + convert to GeoJSON
- Detect EPSG when the source includes it
- Reproject to WGS84 when creating a layer (`proj4`)
- Turf **bbox** when creating a layer (always prefers worker)
- Auto style-type detection when FeatureCollection is large (≥ ~2000 features)

## Setup (pick your app type)

### A. App installs the published package (npm)

Default (Vite with {@link mapDatasetGisWorker}, native ESM, or any host that keeps package files next to each other): relative URL from the package:

```ts
new Worker(new URL('assets/geojson.worker.js', import.meta.url), { type: 'module' });
```

```text
node_modules/@hungpvq/map-dataset/assets/geojson.worker.js
```

**Vite apps** should add the helper so:

1. The package is **not** prebundled into `.vite/deps` (that breaks `import.meta.url` for the GIS worker)
2. CJS helpers (`geojson-rbush`, `@hungpvq/shared-log`, …) are prebundled
3. `maplibre-gl` named imports (`Map`, `Point`, `Popup`, …) work — the published UMD build has no ESM named exports

```ts
import { mapDatasetGisWorker } from '@hungpvq/map-dataset/vite';

export default defineConfig({
  plugins: [vue(), mapDatasetGisWorker()],
});
```

Equivalent manual config (without the maplibre shim — prefer the helper):

```ts
optimizeDeps: {
  exclude: ['@hungpvq/map-dataset', '@hungpvq/map-dataset/geojson', '@hungpvq/map-dataset/create-control', 'maplibre-gl'],
  include: ['geojson-rbush', '@hungpvq/shared-log', '@hungpvq/shared-store', 'maplibre-gl/dist/maplibre-gl.js'],
  needsInterop: ['maplibre-gl/dist/maplibre-gl.js'],
}
```

Stable package entry (for copy / CDN / bundler asset pipelines):

```text
@hungpvq/map-dataset/geojson-worker  →  ./assets/geojson.worker.js
```

#### Non-Vite / relocated chunks (Webpack, Parcel, static HTML, CDN)

If your bundler moves JS into hashed folders so `import.meta.url` no longer sits beside `assets/`, **set the worker URL explicitly** once at startup:

```ts
import { configureGisWorker } from '@hungpvq/map-dataset/geojson';

// After copying `node_modules/@hungpvq/map-dataset/assets/geojson.worker.js`
// to your static output (or serving from a CDN):
configureGisWorker({ url: '/static/geojson.worker.js' });
// or: configureGisWorker({ url: new URL('/static/geojson.worker.js', location.origin) });
```

Webpack example (copy the single file, then configure):

```js
// copy-webpack-plugin
{ from: 'node_modules/@hungpvq/map-dataset/assets/geojson.worker.js', to: 'geojson.worker.js' }

// app entry
configureGisWorker({ url: '/geojson.worker.js' });
```

`mapDatasetGisWorker()` only sets `optimizeDeps.exclude` (no `public/` copy). Do **not** rely on copying into `public/assets` for the old absolute `/assets/…` scheme.

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

Webpack 5 can resolve `new URL(..., import.meta.url)` for app source; for **published** `node_modules` packages it often does **not**. Prefer:

1. Copy `@hungpvq/map-dataset/geojson-worker` (single file) into your output, and
2. Call `configureGisWorker({ url: '…' })` at startup.

If module workers are disabled, the library falls back to the main thread.

## Call the APIs yourself

Exported from `@hungpvq/map-dataset/create-control` (and geo helpers from `/geojson`):

```ts
import {
  GIS_FILE_ACCEPT,
  loadGisFileAsync,
  loadGisTextAsync,
  loadGisUrlAsync,
  parseGisText,
  parseGisTextAsync,
} from '@hungpvq/map-dataset/create-control';
import { reprojectGeojsonToWgs84Async, terminateGeojsonWorker } from '@hungpvq/map-dataset/geojson';

const { geojson, crs, format } = await loadGisFileAsync(file);
const wgs84 = await reprojectGeojsonToWgs84Async(geojson!, crs);

// Sync path — GeoJSON / GeoJSONL / WKT only
parseGisText(geojsonText);

// CSV / KML / GPX / TopoJSON (needs optional peers)
await parseGisTextAsync(csvText, { name: 'sample.csv' });
```

`loadGeojsonFileAsync` / `loadGeojsonTextAsync` remain as aliases.

| Function | Role |
| --- | --- |
| `loadGisFileAsync(file \| files)` | Read one file, a Shapefile sidecar set, parse, detect CRS |
| `loadGisTextAsync(text)` | Parse pasted GIS text (async peers), detect CRS |
| `loadGisUrlAsync(url)` | Fetch in the worker, then parse |
| `parseGisText(text)` | Sync parse for GeoJSON / GeoJSONL / WKT |
| `parseGisTextAsync(text)` | Full text parse including CSV / KML / GPX / TopoJSON |
| `parseGeojsonTextAsync(text)` | Same parse; returns GeoJSON only |
| `reprojectGeojsonToWgs84Async(geojson, crs)` | Reproject to EPSG:4326 (no-op if already 4326) |
| `bboxFromGeojsonAsync(geojson)` | Turf bbox (prefers worker) |
| `detectGeojsonStyleTypesAsync(geojson)` | Style types; worker when file is large |
| `terminateGeojsonWorker()` | Optional cleanup (tests / HMR) |

The client registers with `connectWorkerMonitor` as `geojson`. Progress and logs show on `WorkerControl`: **task-scoped** lines (`ctx.log` / `taskId`) appear under the running task, then flush into the **Worker log** when the task finishes. Worker-level `console.*` (no `taskId`) go straight to the Worker log.

## Vue: do not make GeoJSON reactive

`postMessage` cannot clone Vue Proxies. Store GeoJSON with `markRaw` on form state, and avoid spreading the whole GeoJSON object when you only change CRS.

```ts
import { markRaw } from 'vue';

form.geojson = markRaw(geojson);
```

## This repo (library / workspace)

Worker source must import map-core utilities **relatively**, not `@hungpvq/map-core`. Vite workers cannot resolve workspace package names and would leave them external.

Do **not** enable `worker.plugins` on `@hungpvq/vue-map-dataset`’s Vite config (Vue SFC parse error). Keep `@hungpvq/map-dataset` external there so the wrapper does not rebundle the worker.

Published apps that install `@hungpvq/map-dataset` from npm should keep `mapDatasetGisWorker()` in `vite.config` (optimizeDeps + maplibre shim). Monorepo demos that path-alias into `libs/` should use `worker.format: 'es'` + `nxViteTsPaths` instead — see above.
