# Create Control

Dialog to add a dataset from the UI by **data kind**. `LayerControl` opens this when **Create layer** is clicked — you usually do **not** mount it yourself.

## Props

Shared map props (`mapId`, `position`, `controlLayout`, `controlVisible`, …) apply. CreateControl also registers a **chrome button** (`mdiPlus`) via ModuleContainer `#btn` / toolbar.

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `show` / `v-model:show` | `boolean` | — | Open the create popup |
| `createLayerTypes` | `LayerType[]` | all `LAYER_TYPES` | Allowlist for the type select (`resolveCreateControlLayerTypes`) |
| `controlVisible` | `boolean` | `true` | Show map chrome button; LayerControl nests with `false` |

Standalone:

```vue
<CreateControl v-model:show="show" :create-layer-types="['geojson', 'xyz']" />
```

When nested under LayerControl, the host passes `controlVisible={false}` and `createLayerTypes` so only LayerControl’s **+** opens create.

Layer types (`LAYER_TYPES`):

| Type | Data |
| --- | --- |
| `geojson` | GeoJSON / GIS files (worker `geojson`) |
| `filegdb` | ESRI File Geodatabase — `.gdb.zip` / `*_gdb.zip` / `.gdb` folder (optional peer `gdal3.js`) |
| `xyz` | XYZ URL template — raster or vector (`.pbf`) via `tileKind` / URL sniff |
| `tilejson` | TileJSON URL (`tiles.json`) — `tiles[]` + `vector_layers` metadata |
| `mbtiles` | Local `.mbtiles` — vector or raster from metadata (`format` / `vector_layers`) |
| `pmtiles` | `.pmtiles` file or URL — vector or raster from header `tileType` |

Optional peers for archives: `pmtiles`, `sql.js` (same pattern as GIS peers below).

## Samples

Built-in samples are `CreateControlSample` objects keyed by **`layerKind`** only (`id`, `label`, `layerKind`, `config`, optional `dataUrl`). There is no separate `dataFormat` field — vector vs raster XYZ is carried in `config.tileKind`.

| Kind | Constant | Package entry |
| --- | --- | --- |
| `geojson` | `VECTOR_SAMPLES` | `@hungpvq/map-dataset/vector-tile` |
| `xyz` | `RASTER_XYZ_SAMPLES` + `VECTOR_TILE_SAMPLES` | `/raster` + `/vector-tile` |
| `tilejson` | `TILEJSON_SAMPLES` (MapLibre [demotiles tiles.json](https://demotiles.maplibre.org/tiles/tiles.json)) | `/vector-tile` |
| `mbtiles` / `pmtiles` | none | — |
| `filegdb` | none (upload only) | — |

Helpers: `getCreateControlSamples(layerKind)`, `applyCreateControlSample(sample)`, `loadCreateControlTileJsonFromUrl` / `tileJsonToCreateControlPatch`.

## FileGDB

`LAYER_TYPES.filegdb` / `ConfigFilegdbHelper` accepts a **`.gdb.zip`**, **`*_gdb.zip`**, or a **`.gdb` folder** (drop or “Choose folder”). Parsing uses optional peer **`gdal3.js`** (OpenFileGDB + `jszip` for archives), keeps only feature classes with drawable geometries, and converts each to GeoJSON. Create uses **`createGeoJsonLayersDataset`** (same list shape as MBTiles vector):

- **1 feature class** → one flat list row (`createGeoJsonDataset`)
- **2+ feature classes** → one parent GroupSubList (master show + **fill bound**) and each class as a SubList
- **Settings** → source-layer checkboxes (like MBTiles); **no** style-type or color picker (paint is always auto: area(+outline) + line + point; each class gets `getChartColorAt(index)`)
- Under each checkbox: **feature count**, **geometry types**, and **fields** (inferred from properties) — same chips pattern as TileJSON / MBTiles
- Large classes (**> 5 000** features) start **unchecked** (avoid browser OOM); at least one layer stays enabled
- **Fill bound** → parent + each child from GeoJSON bbox (async with sync fallback)

**gdal3.js load (browser, main thread only):** never Vite-`import` the package (Emscripten `CModule().then` breaks). FileGDB parse stays on the **main thread** via `loadGisFileAsync` (WorkerMonitor id `geojson`, engine `main`) so the GIS worker graph never loads gdal. Default assets come from jsDelivr CDN; override with `configureFileGdbGdal({ path: '/gdal' })` and/or copy `node_modules/gdal3.js/dist/package/*` into static hosting. Main thread uses a classic `<script>` UMD; gdal’s nested worker stays off (`useWorker: false`). Exclude `gdal3.js` from Vite `optimizeDeps` (`mapDatasetGisWorker()` or demos).

## Vector TileJSON / archives

CreateControl lists each `vector_layers` id with a **checkbox** (default all on).

Created dataset list structure:

- **1 enabled source-layer** → one flat list row (same pattern as GeoJSON / raster)
- **2+ enabled source-layers** → **one parent GroupSubList** (master show checkbox) and each layer as a **SubList** with TileServer-style paint (fill+outline, line, point) and a distinct chart color. Children start **collapsed** (`init_show_children: false`).

When TileJSON / MBTiles / PMTiles metadata includes `vector_layers.fields` and/or geometry hints (`tilestats`), CreateControl shows those under each source-layer checkbox. **FileGDB** shows the same chip pattern from the converted GeoJSON (count, geometry types, fields).

**TileJSON** (`ConfigTilejsonHelper`): paste/load a document URL → resolve relative `tiles[]` against that URL (braces `{z}/{x}/{y}` kept) → create with `createVectorTileDataset` (HTTP(S) templates, no archive protocol).

**Local archive protocols** (after `ensureVectorTileProtocols`): MapLibre loads tiles via custom schemes — `mbtiles-local://{archiveId}/{z}/{x}/{y}` and `pmtiles-local://{archiveId}/{z}/{x}/{y}` — both resolve through the archive registry + `getVectorTileArchiveTile` (not the official `pmtiles.Protocol` scheme). Raster archives use the same URLs with `createRasterUrlDataset`.

After TileJSON load or archive upload (or PMTiles URL load), CreateControl shows a **metadata** card (vector vs raster, format, zoom, bounds, layer count) via `buildCreateControlArchiveMetaChips`.

**Area style:** create paths expand `area` into fill + outline line (QGIS-like regions).

Deprecated draft keys `vector` / `rasterxyz` / `vectortile` / `raster` are normalized via `normalizeLayerType` (`vectortile` → `xyz`).

GeoJSON / KML / GPX / Shapefile file read, parse, and CRS reproject run in a [Web Worker](../worker.md). **FileGDB** parse stays on the main thread (gdal3.js). Configure Vite `worker.format: 'es'` (and `nxViteTsPaths` on `worker.plugins` in this Nx workspace) or large non-FileGDB files fall back to the main thread and can freeze the UI. Mount [WorkerControl](/map/core/module/WorkerControl) to watch progress and errors.

## Optional GIS peers

`@hungpvq/map-dataset` does **not** bundle GIS format parsers. Install them in the app when using CreateControl / file import:

```bash
npm i shpjs papaparse jszip topojson-client @tmcw/togeojson @xmldom/xmldom
```

For FileGDB:

```bash
npm i gdal3.js jszip
```

For MBTiles / PMTiles:

```bash
npm i sql.js pmtiles
```

| Format | Peer(s) |
| --- | --- |
| GeoJSON / GeoJSONL / WKT | none (`parseGisText` sync) |
| CSV | `papaparse` |
| KML / GPX | `@tmcw/togeojson`, `@xmldom/xmldom` |
| TopoJSON | `topojson-client` |
| ZIP / KMZ | `jszip` (+ KML peers for KMZ) |
| Shapefile | `shpjs` |
| FileGDB (`.gdb.zip` / folder) | `gdal3.js` (+ `jszip` for archives) |
| MBTiles | `sql.js` |
| PMTiles | `pmtiles` |
| TileJSON | none (fetch JSON) |

Programmatic parse: `parseGisTextAsync` / `loadGis*Async` from `@hungpvq/map-dataset/create-control` — see [GIS worker](../worker.md).

## UX notes

- The dialog keeps a small draft in `sessionStorage` (type, name, CRS) via `loadCreateControlDraft` / `saveCreateControlDraft`.
- If loaded file CRS differs from selected CRS, UI warns that data will be reprojected.
- Multi-file upload accepts one GIS file, or one shapefile set (`.shp` + sidecars / `.zip`).
- **Folder drop:** dropping a directory walks entries (`collectFilesFromDataTransfer`) and keeps GIS extensions only.
- **OS paste:** on the File tab, paste clipboard files as upload, or paste text to switch to Raw and parse (`readClipboardGisPaste` / `parseCreateControlPastedText`).

## Implementation (adapters)

Create / validate / defaults live on core **`LayerHelper`** from `@hungpvq/map-dataset/create-control`. Vue and React adapters only supply framework form UI as **leaf modules**.

| | Import |
| --- | --- |
| Protocol | `LayerHelper`, `LAYER_TYPES`, `ConfigTilejsonHelper`, `ConfigFilegdbHelper`, parse/upload helpers from `@hungpvq/map-dataset/create-control` |
| Vue forms | `CreateControl/config/*.vue` leaf SFCs (`filegdb-upload.vue`, `filegdb-settings.vue`, `tilejson-json.vue`, `archive-settings.vue`, …) |
| React forms | `CreateControl/config/*.tsx` leaf modules (`filegdb-upload.tsx`, `filegdb-settings.tsx`, …) |

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Required | Effect |
| --- | --- | --- | --- |
| `show` | `boolean` | yes | Open the dialog |

## Events

| Name | Payload | Framework |
| --- | --- | --- |
| `update:show` | `boolean` | Vue (`v-model:show`) |
| `onShowChange` | `(show: boolean) => void` | React |

## Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';
import { CreateControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';
</script>
```

See demo apps for a full mount example.

## SemVer

- Renaming CreateControl `LayerType` keys (`vector` → `geojson`, …) is a **breaking** change for consumers that hard-code those strings. Runtime aliases via `normalizeLayerType` soften drafts; treat a published bump as **major** when releasing this contract.
- Adding `tilejson` / `TILEJSON_SAMPLES` / `ConfigTilejsonHelper` is **minor**.
- Adding `filegdb` / `ConfigFilegdbHelper` / optional peer `gdal3.js` is **minor**.
- Removing optional `CreateControlSample.dataFormat` (use `layerKind` + `config.tileKind`) is **minor**.
