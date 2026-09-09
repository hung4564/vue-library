# Peers and bundle size

Brief guide to what you need on the client vs optional GIS format peers.

Related: [Minimal starter](./minimal-starter.md) · [Stable API](./stable-api.md) · [CreateControl](../dataset/module/CreateControl.md)

## Minimal map shell

| Package | Role |
|---------|------|
| `maplibre-gl` | Map engine (peer) |
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

Wire the worker with `@hungpvq/map-dataset/vite` → `mapDatasetGisWorker()` when parsing off the main thread. Soft client size limit: `CREATE_CONTROL_MAX_FILE_BYTES` / `assertCreateControlFileSize` on `@hungpvq/map-dataset/create-control`.

## Keyboard / a11y (map-core)

`bindMapKeyboardShortcuts({ mapId })` (on by default in `Map`): **Esc** closes the top open panel; **`/`** focuses LayerControl search (`data-map-layer-search`). Opt out with `keyboardShortcuts={false}` / `:keyboard-shortcuts="false"`.
