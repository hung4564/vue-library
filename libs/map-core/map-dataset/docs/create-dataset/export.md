# Export (geo-export)

Download layer features as **GeoJSON**, **KML**, **CSV**, or **Shapefile (zip)**. Optionally reproject to a target **CRS** (EPSG) before download.

Import from `@hungpvq/map-dataset/geo-export`.

The **Export** item is **not** auto-added by the list UI builder. Attach it with `list.addMenu(createMenuItemExportGeo())`, or use [`createGeoJsonDataset`](../helper/QuickDatasetCreation.md) which adds Export + Attribute table for you. The item hides when the layer has no GeoJSON source / data-management sibling (raster / vector-tile).

Needs `installMapApp` (or `createDatasetRegistryPlugin`) plus `ComponentManagementControl` so the Export shell can mount — same pattern as Attribute table.

**Naming — `onExport` vs `exportHandler`**

| Where | Prop |
| --- | --- |
| Menu / dataset-part / `GeoExportOptions` / controller | **`onExport`** |
| ExportGeo shell attr (`addComponent` / `ExportGeoComponentAttrs`) | **`exportHandler`** |

Same function. The shell uses `exportHandler` so Vue `$attrs` does not treat `onExport` as a fallthrough `export` event listener. The controller maps `exportHandler` → `onExport` when building the run context.

## Formats

| Format | File | Notes |
| --- | --- | --- |
| GeoJSON | `.geojson` | Always available |
| CSV | `.csv` | Properties + `geometry` JSON column |
| KML | `.kml` | Needs optional peer `tokml` |
| Shapefile | `.zip` | Needs optional peer `@mapbox/shp-write` |

## Data source (same precedence as Attribute Table)

1. **`getCollection`** inject (wins)
2. **Active Attribute Table** bridge (when AT is open for this map + layer) — `filtered` / `selected` use AT search/sort/selection
3. **data-management** sibling — `part.list` with `pageSize: 'all'` (+ `search` / `filter.ids` for filtered/selected)
4. **GeoJSON** source (`getDatasetFeatureCollection`)

## `onExport` (local + server)

One runner for everything. Omit `onExport` → built-in **local** pipeline (resolve → reproject worker → convert → `downloadBlob`).

Custom handler receives `GeoExportContext`:

| Field | Role |
| --- | --- |
| `resolveCollection()` | FeatureCollection for the chosen scope |
| `downloadLocal(format?)` | Built-in local convert + download |
| `format` / `filename` / `scope` / `ids` / `search` / `sort` / CRS | Current run |

Return a **`Blob`** → lib downloads it. Return **`void`** → you handle download / upload yourself.

```ts
import { createMenuItemExportGeo } from '@hungpvq/map-dataset/geo-export';

// Local (default) — omit onExport
list.addMenu(createMenuItemExportGeo());

// Custom / “server”: call API, return Blob
list.addMenu(
  createMenuItemExportGeo({
    onExport: async (ctx) => {
      const fc = await ctx.resolveCollection();
      const res = await fetch('/api/export', {
        method: 'POST',
        body: JSON.stringify({ format: ctx.format, features: fc }),
      });
      return res.blob(); // lib downloads
    },
  }),
);

// Mix: local download + side effect
list.addMenu(
  createMenuItemExportGeo({
    onExport: async (ctx) => {
      await ctx.downloadLocal(ctx.format);
      // analytics / toast…
    },
  }),
);
```

Use `createGeoExportController(layer, options).run({ format, scope, … })` for programmatic runs (busy/error state).

Pass `signal: AbortSignal` to `controller.run({ signal })` to cancel between pipeline steps (`AbortError`). Custom handlers should check `ctx.signal` as well.

## UI modes

| `uiMode` | Behavior |
| --- | --- |
| `'modal'` (default) | Opens ExportGeo shell: **filename**, **scope**, format, CRS, busy |
| `'menu'` | Context-menu format list (`GEO_EXPORT_COMPONENT_KEY.formatMenu`) |
| `'click'` | One menu row; runs export immediately with `formats[0]` (default `geojson`) |

```ts
list.addMenu(createMenuItemExportGeo({ uiMode: 'menu', formats: ['geojson', 'csv'] }));
list.addMenu(createMenuItemExportGeo({ uiMode: 'click', formats: ['geojson'] }));
```

Pass `uiMode` on the **menu item**. Dataset-part options still merge (part wins) for formats / `onExport` / etc.

### Scope

`'all' | 'filtered' | 'selected'`. Modal shows a scope picker when `scopes` has more than one value (default `['all']`). From Attribute Table, scopes default to all three; default selection prefers **selected** if any rows are selected, else **filtered**.

## Attribute Table Export

Toolbar **Export** (`ui.export`, default `true`) uses the same geo-export options / `onExport`. While AT is open, export reads the active AT bridge for filtered/selected.

```ts
createDatasetPartAttributeTable('attribute-table', {
  ui: { export: true }, // default
});
```

## Registry overrides

**SoT keys:** `GEO_EXPORT_COMPONENT_KEY` (plugins + `createExportGeoAddComponent` use these).  
`LIST_VIEW_MENU_COMPONENT_KEY.exportGeo` / `.exportGeoMenu` are **aliases** of `.root` / `.formatMenu`.

Two levels (same idea as Attribute Table `cellComponent`):

| Level | How |
| --- | --- |
| **Global** (map) | `UniversalRegistry.registerComponent` / `registerComponentForMap` with `GEO_EXPORT_COMPONENT_KEY.form` / `.loading` / … |
| **Local** (dataset) | `formComponent` / `loadingComponent` on the dataset part or menu — Registry **`string` key** or a Vue/React **component** |

Precedence for form / loading: **local** → global key → built-in default. A local **component** skips the global key so a map-level registration cannot override it.

| Key | Role |
| --- | --- |
| `GEO_EXPORT_COMPONENT_KEY.root` | Full modal shell |
| `GEO_EXPORT_COMPONENT_KEY.form` | Form body |
| `GEO_EXPORT_COMPONENT_KEY.loading` | Busy indicator |
| `GEO_EXPORT_COMPONENT_KEY.formatMenu` | Format submenu (`uiMode: 'menu'`) |

```ts
// Global (all layers on this map)
UniversalRegistry.registerComponentForMap(
  mapId,
  GEO_EXPORT_COMPONENT_KEY.loading,
  MyLoading,
);

// Local — string key (register that key yourself)
createDatasetPartGeoExport('export', {
  formComponent: 'my-export-form',
  loadingComponent: 'my-export-loading',
});

// Local — pass a Vue/React component directly (like AT cellComponent)
createDatasetPartGeoExport('export', {
  formComponent: MyExportForm,
  loadingComponent: MyExportLoading,
});
```

Helpers: `resolveGeoExportUiSlot`.

## Dataset part (`createDatasetPartGeoExport`)

Part options win over menu args (`resolveGeoExportOption`):

```ts
dataset.add(
  createDatasetPartGeoExport('export', {
    uiMode: 'modal',
    formats: ['geojson', 'csv'],
    scopes: ['all', 'filtered', 'selected'],
    sourceCrs: '4326',
    targetCrs: '3857',
    onExport: myHandler,
  }),
);
list.addMenu(createMenuItemExportGeo());
```

Hide at render time: `menuContext: { disabledExport: true }`. With `createGeoJsonDataset`, skip via `export: false`.

## Call without a menu

```ts
import { createGeoExportController } from '@hungpvq/map-dataset/geo-export';

const ctrl = createGeoExportController(layer, { mapId });
try {
  await ctrl.run({ format: 'geojson', filename: 'cities' });
} finally {
  ctrl.dispose();
}
```

Helpers: `resolveGeoExportCrs`, `resolveExportCollection`, `getDatasetFeatureCollection`.

## Demo

Vue/React demo map: `/#/dataset-geo-export` — modal, menu formats, **click**, custom `onExport`, AT scopes (every layer has Attribute table), and a layer that passes Vue/React `formComponent`.

## Vue / React

Mount `LayerControl` + `ComponentManagementControl` with `installMapApp`. KML / Shapefile need:

```bash
npm install tokml @mapbox/shp-write
```

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Modal shows **No features to export** | Scope resolved to an empty FeatureCollection (e.g. selected with no rows). Change scope or select rows in the Attribute table. |
| **Install optional peer "tokml"** | KML needs `npm i tokml`. |
| **Install optional peer "@mapbox/shp-write"** | Shapefile needs `npm i @mapbox/shp-write`. |
| Download closes with no file (React StrictMode) | Use current `@hungpvq/react-map-dataset` — ExportGeo creates the controller inside `useEffect` so StrictMode dispose does not leave a dead instance. |
| Custom handler not called from modal | Pass it as dataset-part / menu `onExport`; the shell attr is `exportHandler` (see tip above). |
