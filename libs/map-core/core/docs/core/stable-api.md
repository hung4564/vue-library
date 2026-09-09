# Stable API (v1)

Allowlist of symbols and protocols we treat as **Stable** for SemVer on `1.x`.

Root and domain barrels use **explicit named exports** (no public `export *`). Aggregation for implementation lives in `src/internal-barrel.ts` (not a package entry). Runtime surface is locked by `public-api.spec.ts` (root **and** each domain subpath).

**All current root and subpath runtime exports are Stable.** Each package keeps `*_EXPERIMENTAL_RUNTIME_EXPORTS = []` for the lock pattern; new symbols should be added to Stable unless intentionally staged as Experimental later.

**Runtime lock:** each entry asserts `Object.keys(import * as api from '<entry>')` equals its Stable ∪ Experimental allowlist in `public-api.spec.ts` (type-only exports are erased at runtime and omitted from the lock). Root and subpaths may export **first-party** types via explicit `export type { … }` — do **not** re-export types that already live in third-party packages (`geojson`, `maplibre-gl`, …); import those from the original package.

| Package | Spec |
|---------|------|
| `@hungpvq/map-core` | `libs/map-core/core/src/public-api.spec.ts` (root + subpaths) |
| `@hungpvq/map-dataset` | `libs/map-core/map-dataset/src/public-api.spec.ts` |
| `@hungpvq/map-draw` | `libs/map-core/map-draw/src/public-api.spec.ts` |
| `@hungpvq/vue-map-core` | `libs/vue/map-core/src/public-api.spec.ts` |
| `@hungpvq/vue-map-dataset` | `libs/vue/map-dataset/src/public-api.spec.ts` |
| `@hungpvq/vue-map-draw` | `libs/vue/map-draw/src/public-api.spec.ts` |
| `@hungpvq/vue-map-devtools` | `libs/vue/map-devtools/src/public-api.spec.ts` |
| `@hungpvq/react-map-core` | `libs/react/map-core/src/public-api.spec.ts` |
| `@hungpvq/react-map-dataset` | `libs/react/map-dataset/src/public-api.spec.ts` |
| `@hungpvq/react-map-draw` | `libs/react/map-draw/src/public-api.spec.ts` |
| `@hungpvq/react-map-devtools` | `libs/react/map-devtools/src/public-api.spec.ts` |

- Adding a **runtime** export → named export in the entry barrel + Stable (or Experimental) list in that package’s `public-api.spec.ts` + this page when documenting the area.
- Removing a root **or** subpath runtime export is a **major**. Adding a **new** subpath while keeping root is usually a **minor**.

Related: [SemVer checklist](../../../README.md#checklist-semver--breaking-change) · [Minimal starter](./minimal-starter.md) · [Map store](./map-store.md) · [Error handling](./error-handling.md) · [UniversalRegistry controls](./registry-controls.md) · [components](./registry-components.md)

## Registry architecture

- **Host:** `UniversalRegistry` in `@hungpvq/map-core` — methods, menu handlers, control handles (one resolve path: map-scoped then global).
- **Adapters:** `@hungpvq/vue-map-core` / `@hungpvq/react-map-core` **extend** that class and only add `registerComponent` / `getComponent`.
- Prefer `UniversalRegistry` / `runMapControlAction` from `@hungpvq/map-core` in framework-agnostic code (`map-dataset`, context menu).

## `@hungpvq/map-core` package entries

| Entry | Role |
|-------|------|
| `.` | Platform shell: store/`getMap`, registry, errors, mitt, shared GIS utils, shell locales, host `WorkerMonitor` |
| `./style.css` | Shared map CSS |
| `./worker` | CSS/DOM-free worker helpers |
| `./basemap` | Basemap adapters, services, `INIT_BASEMAPS`, `BasemapError` |
| `./crs` | CRS catalog, store defaults, `CRS_CONTROL_LOCALE` |
| `./event` | `EventManager`, event models, bbox ranger |
| `./image` | Map image load/store helpers |
| `./legend` | `LegendService`, `MapLegend`, paint helpers |
| `./measurement` | `MeasurementService`, measure modes, format helpers |
| `./menu` | Map context menu builders / actions |
| `./print` | `PrintService`, export helpers |
| `./theme` | Theme bootstrap / resolve / `MAP_THEME_*` |
| `./toolbar` | Toolbar strategies / store APIs |

### Root (`.`) highlights

Runtime allowlist: `MAP_CORE_STABLE_RUNTIME_EXPORTS` in `public-api.spec.ts` (~80 symbols).

| Area | Stable surface |
|------|----------------|
| Map access | `getMap` → `MapSimple \| undefined`, `registerMapAccessor`, `MapStoreManager`, `MAP_STORE_KEY`, `hasMapInstance` — [map-store](./map-store.md) |
| Registry | `UniversalRegistry`, `runMapControlAction`, `MapControlHandle`, `REGISTRY_*`, `filterMapControls` |
| Init / errors | `MapInitializer`, `MapError` family, `errorHandler` / `MapErrorHandler` — [error-handling](./error-handling.md) |
| Shared GIS | `fitBounds`, `bboxFromGeojson`, `reprojectGeojsonToWgs84`, coordinate/DMS helpers, color/`logHelper`, map-info |
| Worker host | `WorkerMonitor`, `connectWorkerMonitor`, `runMonitoredTask`, … (in-worker: `./worker`) |
| Shell locales | `MAP_ACTION_*`, Home/Goto/Globe/Info/Setting, `WORKER_*`, `REGISTRY_*` |
| Types | `MapSimple`, `WithMapPropType`, `MapControlHandle`, … |

Domain APIs (**theme, basemap, measurement, …**) are **not** on the root barrel — import from the matching subpath.

**Earlier removals (breaking):** Map Compare / multi-map helpers; domain symbols moved off root onto subpaths (this release).

## `@hungpvq/map-dataset`

Full runtime allowlist: `public-api.spec.ts` (~300 symbols). Highlights:

| Area | Stable surface |
|------|----------------|
| Service | `DatasetService` |
| Builders | `createGeoJsonDataset`, `createRasterUrlDataset`, `LayerSimpleMapboxBuild` |
| Protocol | `IDataset` and capability interfaces via `export type` |
| Menu ids | `LIST_VIEW_MENU_ID`, `LIST_VIEW_MENU_COMPONENT_KEY` **string values** |
| Vite | `mapDatasetGisWorker()` / `@hungpvq/map-dataset/vite` |

## `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`

Full root surfaces are Stable (~94 Vue / ~101 React runtime symbols — see each `public-api.spec.ts`). Shared highlights:

| Area | Stable surface |
|------|----------------|
| Shell | `Map` container, `@map-loaded` / `onMapLoaded` (and destroy equivalents) |
| Hooks | `useMap`, `useMapInstance`, `useShow`, `useRegisterMapControl`, `useUniversalRegistry` |
| Store helpers | `createMapScopedStore`, `destroyMapScopedStore`, `getStore`, `addStore` (not `getMap`) — [map-store](./map-store.md) |
| Registry | Framework `UniversalRegistry`, `RegistryItem` |
| Controls | ModuleContainer controls + **control ids** / action types ([registry-controls](./registry-controls.md)); both export `ActionControl` |
| Types | First-party: `WithShowProps`; prefer `WithMapPropType` / `MapSimple` from `@hungpvq/map-core` |

Framework idioms (both Stable, different names): Vue `Collapse` / `InputTextArea` / `KEY` / `MITT_KEY` / `makeShowProps` / `withMapProps`; React `BaseCollapse` / `InputTextarea` / `MapContext*` / `MapGlobalStoreProvider` / `ReactMapStoreAdapter` / `useBreakpoints` / …

Adapters do **not** re-export `@hungpvq/map-core` protocol (`getMap`, `errorHandler`, …). There is no adapter `handleError` — apps use `errorHandler` from `@hungpvq/map-core`. Compare / multi-map UI and `getIsMulti` are not part of the adapters.

## `@hungpvq/vue-map-dataset` / `@hungpvq/react-map-dataset`

| Area | Stable surface |
|------|----------------|
| Bootstrap | `createDatasetRegistryPlugin()` |
| Hooks | `useMapDataset` |
| UI | `LayerControl`, `IdentifyControl`, `IdentifyResultControl`, `IdentifyShowFirstControl`, `AttributeTable`, `StyleControl`, `CreateControl`, `ComponentManagementControl`, `DatasetDetail`, `LayerMenuDefaultHandle`, … |
| Core boundary | Builders/services/types from `@hungpvq/map-dataset` |

Menu condition: Vue `provideMenuConditionContext` / `MENU_CONDITION_CONTEXT_KEY`; React `MenuConditionProvider`. React also has imperative `getMapDatasetStore` / `notifyMapDatasetStore`.

## `@hungpvq/map-draw`

| Area | Stable surface |
|------|----------------|
| Service | `DrawService` |
| Protocol | `DrawingType`, `DrawingTypeName`, `MAP_DRAW_EVENT`, `MapDrawOption` |
| Engine mount | `MapDraw`, `StaticMode`, `DRAW_MODES`, `getDrawStyles` |
| Styles / query / ids | `getFeatureByMap`, `getFirstFeatureByMap`, `getFeatureId`, `sameFeature` |

## `@hungpvq/vue-map-draw` / `@hungpvq/react-map-draw`

| Area | Stable surface |
|------|----------------|
| Shell | `DrawControl`, `InspectControl` (shared `InspectController`), `useMapDraw`, `isDraftOption`, `useConfigDrawControl`, `useMapDrawStore` |
| Control ids | `mapDrawDraftList`, `mapInspectControl` |
| Locales | `DRAW_CONTROL_LOCALE`, `INSPECT_CONTROL_LOCALE` |
| Core boundary | Protocol from `@hungpvq/map-draw` — adapters do **not** re-export core |

Consumer docs: `libs/map-core/map-draw/docs` → `/map/draw/`.

## `@hungpvq/vue-map-devtools` / `@hungpvq/react-map-devtools`

| Area | Stable surface |
|------|----------------|
| Vue bootstrap | `DevtoolsPlugin`, `uninstallDevtools` |
| React bootstrap | `installDevtools`, `uninstallDevtools` |
| Panel | `Devtools` |
| Store helpers (both) | `DevtoolLogAdapter`, `devtoolLogAdapter`, `devtoolState`, `getDevtoolState`, `useDevtoolState`, `subscribeDevtoolState`, `toggleDevtoolOpen`, `setDevtoolActiveTab`, `clearDevtoolLogs`, `clearDevtoolErrors` |
| Docs | [devtools.md](./devtools.md) |

Adapters do **not** re-export `@hungpvq/map-core` (`errorHandler` from map-core). See [Error handling](./error-handling.md).

## CSS

Documented `--map-*` tokens and theme classes (`map-theme-*`) in [CSS variables](./css-variables.md). `style.css` package entries are stable import paths.

## Experimental slot

`*_EXPERIMENTAL_RUNTIME_EXPORTS` is currently **empty** on all map packages. Prefer adding new root symbols as Stable. If a future symbol is intentionally unstable, list it under Experimental (may change in a **minor**); removing it from the root remains a **major**.

## Enforcing the allowlist

1. Edit `src/index.ts` with **named** exports only (no public `export *`). Prefer `export { X } from './internal-barrel'` (or from a feature module). Export first-party types with explicit `export type { … }` — never `export type *`, and never re-export third-party library types.
2. Put new implementation symbols in feature modules / `internal-barrel`; only promote to root `index.ts` + allowlist when intentional.
3. Update the matching `public-api.spec.ts` allowlist arrays (runtime symbols only).
4. Update this page when changing Stable.
5. Do not hand-edit package `CHANGELOG.md` unless asked — use release tooling.
