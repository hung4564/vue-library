# Peers and bundle size

Brief guide to what you need on the client vs optional GIS format peers.

Related: [Minimal starter](./minimal-starter.md) · [Stable API](./stable-api.md) · [CreateControl](../dataset/module/CreateControl.md)

## Lite recipe (browser shell only)

Smallest useful client bundle for **inline GeoJSON / in-memory layers**:

1. Peers: `maplibre-gl` (+ Vue or React). **Required** for `@hungpvq/map-core`, `@hungpvq/map-dataset`, and the framework adapters — install it in the app; it is not a transitive dependency of `map-dataset`.
2. Packages: `@hungpvq/map-core` + `@hungpvq/vue-map-core` **or** `@hungpvq/react-map-core`.
3. Optional dataset list UI: `@hungpvq/map-dataset` + matching adapter + `installMapApp` / `createMapAppPlugin`.
4. Import CSS once — the **full** set (shared cores + framework adapters + draggable):

```ts
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';
// React: react-map-core + react-map-dataset + react-draggable
```

Follow [Minimal starter](./minimal-starter.md).

**Do not install** for lite: `@hungpvq/map-draw`, CreateControl GIS peers (`shpjs`, `papaparse`, togeojson, jszip, topojson-client), or the GIS Vite worker plugin.

There is no separate npm “lite” package — use the root/`./style.css` entries and skip optional peers/subpaths.

## Minimal map shell

| Package | Role |
|---------|------|
| `maplibre-gl` | Map engine (**peer** on map-core, map-dataset, adapters) |
| `@hungpvq/map-core` | Store, registry, theme, a11y helpers |
| `@hungpvq/vue-map-core` or `@hungpvq/react-map-core` | `Map` shell + controls |
| `@hungpvq/map-dataset` + vue/react adapter | Datasets + LayerControl (optional for bare canvas) |

Bootstrap adapters with `installMapApp` / `createMapAppPlugin` (Vue) so theme + dataset registry install once. CSS still imported by the app.

**Not required** for inline GeoJSON / in-memory FeatureCollection: GIS worker Vite plugin, `shpjs`, CSV/KML parsers.

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

Declared **peerDependencies** (and workspace `@hungpvq/*` deps) must stay **external** in the published Rollup/Vite lib build — they are never bundled into `@hungpvq/map-*` dist. Install peers in the app; see lite vs full GIS recipes above.

## Theme

`bootstrapMapTheme('auto')` follows `prefers-color-scheme` (light/dark). ThemeControl also listens to the media query when mode is `auto`.

**Process-global (not per `mapId`):** `bootstrapMapTheme` / `applyMapThemeClass` write the theme class on `document.documentElement` and persist via `MAP_THEME_STORAGE_KEY`. Multiple maps on one page share one chrome theme. Platform accessors (`registerMapAccessor` / READY) are also process-scoped **last-writer-wins** — prefer a single framework host bootstrap (`installMapApp` / Map shell). Details: [Map store — multi-map caveats](./map-store.md#multi-map-caveats-apps-with-map-a--map-b).

## Keyboard / a11y (map-core)

`bindMapKeyboardShortcuts({ mapId })` (on by default in `Map`): **Esc** closes the top open panel; **`/`** focuses that map’s LayerControl search (`[data-map-layer-search][data-map-id]`). Opt out with `keyboardShortcuts={false}` / `:keyboard-shortcuts="false"`.

## fitBounds overlays

`fitBounds` pads left/right for open sidebars so fitted data stays in the visible map area. Pass `ignoreOverlays: true` for flat padding only.
