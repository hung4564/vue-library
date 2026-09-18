# Peers and bundle size

Brief guide to what you need on the client vs optional feature peers.

Related: [Install from npm](./install-from-npm.md) · [Minimal starter](./minimal-starter.md) · [Stable API](./stable-api.md) · [CreateControl](../dataset/module/CreateControl.md)

## Required vs shipped vs optional

| Kind | Packages | Who installs |
|------|----------|--------------|
| **Meta package (recommended)** | `@hungpvq/vue-map` / `@hungpvq/react-map` | App installs meta + `maplibre-gl` + framework; pulls core/dataset/draggable/shared |
| **Required peers** | `maplibre-gl`, `vue`/`react` (and `react-dom`) | App (must be single MapLibre instance) |
| **Shipped with `@hungpvq/map-core`** (dependencies, still external in dist) | Granular `@turf/*`, `proj4`, `@mdi/js`, `mitt` | Automatic with `map-core` — **do not** install `@turf/turf` for the library |
| **Optional peers** | `file-saver` (print), `@maplibre/maplibre-gl-style-spec` (legend expression eval), GIS format parsers on `map-dataset` | App when using that feature |

## Meta package recipe (preferred)

```bash
# Vue
npm install @hungpvq/vue-map maplibre-gl vue

# React
npm install @hungpvq/react-map maplibre-gl react react-dom
```

```ts
// Vue
import { installMapApp } from '@hungpvq/vue-map';
import '@hungpvq/vue-map/style.css';

// React
import { installMapApp } from '@hungpvq/react-map';
import '@hungpvq/react-map/style.css';
```

Still import UI from `@hungpvq/vue-map-core` / `vue-map-dataset` (or React equivalents). Draw / devtools stay separate packages.

Full external walkthrough (copy-paste + troubleshooting): [Install from npm](./install-from-npm.md).

## Lite recipe (browser shell, a-la-carte)

Smallest useful client for **inline GeoJSON / in-memory layers** without the meta bag:

```bash
# Vue
npm install maplibre-gl @hungpvq/map-core @hungpvq/vue-map-core \
  @hungpvq/vue-draggable @hungpvq/shared @hungpvq/shared-store @hungpvq/shared-log \
  @mdi/js @jamescoyle/vue-icon

# React
npm install maplibre-gl @hungpvq/map-core @hungpvq/react-map-core \
  @hungpvq/react-draggable @hungpvq/shared @hungpvq/shared-store @hungpvq/shared-log \
  @mdi/js @mdi/react
```

Notes:

1. `maplibre-gl` stays a **peer** on map-core, map-dataset, and adapters — install once in the app.
2. Turf / proj4 / `@mdi/js` come transitively from `@hungpvq/map-core` (and `@mdi/js` also from map-dataset). No `@turf/turf` peer.
3. **Draggable** is an **optional** peer on adapters, but the default `Map` shell and most panel controls import it — install it for a normal UI shell. Omit only if you build a custom host without those components.
4. Optional dataset list UI: `@hungpvq/map-dataset` + matching adapter + `installMapApp` / `createMapAppPlugin`.
5. Import CSS once — shared cores + framework adapters + draggable:

```ts
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';
// React: react-map-core + react-map-dataset + react-draggable
```

Follow [Minimal starter](./minimal-starter.md).

**Do not install** for lite: `@hungpvq/map-draw`, CreateControl GIS peers (`shpjs`, `papaparse`, togeojson, jszip, topojson-client), `file-saver`, `@maplibre/maplibre-gl-style-spec`, or the GIS Vite worker plugin.

There is no separate npm “lite” package beyond `@hungpvq/vue-map` / `@hungpvq/react-map` — for a-la-carte use the root/`./style.css` entries and skip optional peers/subpaths.

## Feature optional peers (`@hungpvq/map-core`)

| Peer | When needed |
|------|-------------|
| `file-saver` | Print / `exportFile` (`@hungpvq/map-core/print`) |
| `@maplibre/maplibre-gl-style-spec` | Legend expression evaluation (`@hungpvq/map-core/legend`) |

## Full GIS / CreateControl

When using CreateControl file upload / `loadGis*` / worker parse, install optional peers as needed:

| Peer | Formats |
|------|---------|
| `shpjs` | Shapefile |
| `papaparse` | CSV |
| `@tmcw/togeojson` + `@xmldom/xmldom` | KML / GPX |
| `jszip` | KMZ / zipped shapefile |
| `topojson-client` | TopoJSON |

Wire the worker with `@hungpvq/map-dataset/vite` → `mapDatasetGisWorker()` when parsing off the main thread. Soft client size limit: `CREATE_CONTROL_MAX_FILE_BYTES` / `assertCreateControlFileSize` on `@hungpvq/map-dataset/create-control`. CreateControl remembers last name/type/CRS in `sessionStorage` (`load/saveCreateControlDraft`).

## Bundle policy

Declared **peerDependencies** and **dependencies** that are third-party / workspace packages stay **external** in the published Rollup/Vite lib build — they are never bundled into `@hungpvq/map-*` dist. Required peers: install in the app. Shipped dependencies: npm installs them with the package. Optional peers: install when you use the feature. See recipes above.

## Theme

`bootstrapMapTheme('auto')` follows `prefers-color-scheme` (light/dark). ThemeControl also listens to the media query when mode is `auto`.

**Theme:** default `bootstrapMapTheme` / `ThemeControl` use `scope: 'document'` (`html` + `MAP_THEME_STORAGE_KEY`). For independent multi-map chrome use `scope: 'map'` / `applyMapTheme(..., { scope: 'map', mapId })`. **Platform accessors** are process-scoped **multi-host** (`MAP_PLATFORM_HOST` / `{ hostId }`). Details: [Map store — multi-map caveats](./map-store.md#multi-map-caveats-apps-with-map-a--map-b).

## Keyboard / a11y (map-core)

`bindMapKeyboardShortcuts({ mapId })` (on by default in `Map`): **Esc** closes the top open panel; **`/`** focuses that map’s LayerControl search (`[data-map-layer-search][data-map-id]`). Opt out with `keyboardShortcuts={false}` / `:keyboard-shortcuts="false"`.

## fitBounds overlays

`fitBounds` pads left/right for open sidebars so fitted data stays in the visible map area. Pass `ignoreOverlays: true` for flat padding only.
