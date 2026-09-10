# Stable API (v1)

Allowlist of symbols and protocols we treat as **Stable** for SemVer on `1.x`.

Root and domain barrels use **explicit named exports** (no public `export *`). Aggregation for implementation lives in `src/internal-barrel.ts` (not a package entry). Runtime surface is locked by `public-api.spec.ts` (root **and** each domain subpath).

**All current root and subpath runtime exports are Stable or Experimental.** For Vue/React `map-core`, Experimental field/UI helpers live on **`./fields`** (not the root). Other packages may list Experimental symbols in `*_EXPERIMENTAL_RUNTIME_EXPORTS` on a published barrel (may change in a **minor**). Removing an Experimental export from a published barrel is still a **major**.

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

Related: [SemVer checklist](https://github.com/hung4564/vue-library/blob/main/libs/map-core/README.md#checklist-semver--breaking-change) · [Minimal starter](./minimal-starter.md) · [Peers and bundle](./peers-and-bundle.md) · [Map store](./map-store.md) · [Error handling](./error-handling.md) · [UniversalRegistry controls](./registry-controls.md) · [components](./registry-components.md)

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
| `./print` | `PrintService`, export helpers (`exportMapbox*`, `waitMapIdleAndTiles`) |
| `./theme` | Theme bootstrap / resolve / `MAP_THEME_*` |
| `./toolbar` | Toolbar strategies / store APIs |

### Root (`.`) highlights

Runtime allowlist: `MAP_CORE_STABLE_RUNTIME_EXPORTS` in `public-api.spec.ts` (~80 symbols).

| Area | Stable surface |
|------|----------------|
| Map access | `getMap` → `MapSimple \| undefined`, `registerMapAccessor`, `MapStoreManager`, `MAP_STORE_KEY`, `hasMapInstance` — [map-store](./map-store.md) |
| Registry | `UniversalRegistry`, `runMapControlAction`, `MapControlHandle`, `REGISTRY_*`, `filterMapControls` |
| Init / errors | `MapInitializer`, `MapError` family, `errorHandler` / `MapErrorHandler` — [error-handling](./error-handling.md) |
| A11y | `bindMapKeyboardShortcuts`, `closeTopOpenMapControl`, `focusMapLayerSearch`, `MAP_LAYER_SEARCH_SELECTOR` |
| Shared GIS | `fitBounds`, `bboxFromGeojson`, `reprojectGeojsonToWgs84`, coordinate/DMS helpers, color/`logHelper`, map-info |
| Worker host | `WorkerMonitor`, `connectWorkerMonitor`, `runMonitoredTask`, … (in-worker: `./worker`) |
| Shell locales | `MAP_ACTION_*`, Home/Goto/Globe/Info/Setting, `WORKER_*`, `REGISTRY_*` |
| Types | `MapSimple`, `WithMapPropType`, `MapControlHandle`, … |

Domain APIs (**theme, basemap, measurement, …**) are **not** on the root barrel — import from the matching subpath.

Toolbar helpers on `@hungpvq/map-core/toolbar`: `mdiIcon`, `mdiButtonState`, `compassIcon` (build control button state with MDI paths).

## `@hungpvq/map-dataset`

**Breaking major:** domain symbols moved off the root onto named subpaths. Root no longer re-exports builders, identify, menu, style, create-control, or geo-export APIs. Full runtime allowlists: `public-api.spec.ts` (root + each subpath).

| Entry | Stable surface (highlights) |
|-------|-----------------------------|
| `.` | `DatasetService`, tree/`createRootDataset`/`createGroupDataset`, generic parts, highlight, attribute-table (`ATTRIBUTE_TABLE_ROW_HEIGHT`, `getVirtualRowWindow`, …), layer/dataset locales, `IDataset` (+ shared protocol types) |
| `./geojson` | `createGeoJsonDataset`, `createGeojsonHereDataset`, geojson source/parse/worker (`terminateGeojsonWorker`, …), `GEOJSON_STYLE_AUTO`, `geojsonLocalAdapter` |
| `./raster` | `createRasterUrlDataset`, raster source part, `RASTER_XYZ_SAMPLES` |
| `./vector-tile` | `createDatasetPartVectorTileComponent`, `VECTOR_SAMPLES` |
| `./identify` | `IDENTIFY_*`, `createDatasetPartIdentify*`, `handleMultiIdentify*`, scope helpers |
| `./menu` | `LIST_VIEW_MENU_*`, `MAP_CONTEXT_MENU_ID`, `createMenu*`, `handleMenuAction*`, menu part builders |
| `./style` | `LayerSimpleMapboxBuild`, `LayerRasterMapboxBuild`, `*_CONFIG`, `TABS`, `STYLE_CONTROL_LOCALE` |
| `./create-control` | `CREATE_CONTROL_*`, `assertCreateControlFileSize` / `formatCreateControlBytes` / `CREATE_CONTROL_MAX_FILE_BYTES`, `parseGis*` / `loadGis*`, `getCreateControlSamples` — GIS format peers (`shpjs`, `papaparse`, `@tmcw/togeojson`, `jszip`, `topojson-client`, `@xmldom/xmldom`) are **optional**; install when using CreateControl / file parse — [peers-and-bundle](./peers-and-bundle.md) |
| `./geo-export` | `GEO_EXPORT_*`, `exportDatasetGeo`, `downloadBlob`, export menu helpers |
| `./vite` | `mapDatasetGisWorker()` |
| `./style.css` / `./assets/*` | package CSS and static assets |

`LIST_VIEW_MENU_ID` / `LIST_VIEW_MENU_COMPONENT_KEY` **string values** remain SemVer-stable (import from `@hungpvq/map-dataset/menu`).

## `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`

Root barrels are **Stable only** (see each `public-api.spec.ts`). Field / lightweight UI helpers live on **`./fields`** (Experimental; may change in a **minor**).

**Breaking (major):** importing former Experimental symbols (`Input*`, `MapCard`, `MapErrorToast`, …) from the package root fails — use `@hungpvq/vue-map-core/fields` / `@hungpvq/react-map-core/fields`. Former `BaseButton` is removed — use Stable root `MapControlButton`.

Shared root highlights:

| Area | Stable surface |
|------|----------------|
| Shell | `Map` container, `@map-loaded` / `onMapLoaded` (and destroy equivalents); optional `keyboardShortcuts` (default true); mounts `MapErrorToast` internally from `./fields` |
| Hooks | `useMap`, `useMapInstance`, `useShow`, `useRegisterMapControl`, `useUniversalRegistry` |
| Store helpers | `createMapScopedStore`, `destroyMapScopedStore`, `getStore`, `addStore` (not `getMap`) — [map-store](./map-store.md) |
| Registry | Framework `UniversalRegistry`, `RegistryItem` |
| Controls | ModuleContainer controls + **control ids** / action types ([registry-controls](./registry-controls.md)); both export `ActionControl`; action UI uses `MapControlButton` (`variant`: `icon` \| `plain` \| `text` \| `tonal` \| `outlined` \| `filled`; `size`: `small` \| `medium` \| `large` \| number px — see [css-variables](./css-variables.md#core---mapcontrolbutton--mapbutton)) / `MapCommonButton` |
| Types | First-party: `WithShowProps`; prefer `WithMapPropType` / `MapSimple` from `@hungpvq/map-core` |

Framework idioms (Stable): Vue `makeShowProps` / `withMapProps`; React `MapContext*` / `MapGlobalStoreProvider` / `ReactMapStoreAdapter` / `useBreakpoints` / …

Package entries: `.` + `./style.css` + **`./fields`**.

### `@hungpvq/vue-map-core/fields` / `@hungpvq/react-map-core/fields`

| Symbol | Notes |
|--------|--------|
| `BaseCollapse`, `Collapse` | Collapse panel — **canonical `BaseCollapse`**; `Collapse` alias |
| `InputCheckbox`, `InputChoose`, `InputColorPicker`, `InputCrs`, `InputFile`, `InputSelect`, `InputSlider`, `InputText`, `InputTextArea`, `InputTextarea` | Form helpers — **canonical `InputTextArea`**; `InputTextarea` alias |
| `MapButton` | Map-control chrome (`variant` / `size` same as `MapControlButton`; prefer Stable root `MapControlButton` in apps) |
| `MapCard`, `MapIcon`, `MapImage` | Lightweight map UI primitives |
| `MapErrorToast` | Listens to `errorHandler`; “Open errors” dispatches `hungpvq:map-open-devtools-errors` |
| `KEY`, `MITT_KEY` | Vue-only (on Vue `/fields`) |
| `DragDropFile` | React-only (on React `/fields`) |

```ts
import { MapControlButton } from '@hungpvq/vue-map-core';
import { InputText } from '@hungpvq/vue-map-core/fields';
// or `@hungpvq/react-map-core` / `.../fields`
```

`MapControlButton`: `variant` + `size` (`small` \| `medium` \| `large` \| px). Prefer `size="small"` in dense layer rows; default `medium` matches draggable header chrome (32px).

Prefer canonical names in new code (`MapControlButton`, `BaseCollapse`, `InputTextArea`). Authoritative lock: root Stable + `*_FIELDS_RUNTIME_EXPORTS` in each adapter `public-api.spec.ts`.

**Parity lock:** `libs/map-core/core/src/dual/parity-catalog.ts` + `vue-react-parity.spec.ts` (shared control ids + shared Stable root + shared `/fields` Experimental names).

Dataset / draw / `@hungpvq/map-core` Experimental allowlists are **empty / reserved**.

Adapters do **not** re-export `@hungpvq/map-core` protocol (`getMap`, `errorHandler`, …). There is no adapter `handleError` — apps use `errorHandler` from `@hungpvq/map-core`.

## `@hungpvq/vue-map-dataset` / `@hungpvq/react-map-dataset`

| Area | Stable surface |
|------|----------------|
| Bootstrap | `installMapApp`, `createMapAppPlugin` (Vue), `createDatasetRegistryPlugin()` |
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
| Bootstrap (both) | `installDevtools`, `uninstallDevtools` |
| Panel | `Devtools` (optional prop `containerId` for map `DraggableContainer`; mobile uses `DraggableItemBottom`) |
| Store helpers (both) | `DevtoolLogAdapter`, `devtoolLogAdapter`, `devtoolState`, `getDevtoolState`, `useDevtoolState`, `subscribeDevtoolState`, `toggleDevtoolOpen`, `setDevtoolActiveTab`, `clearDevtoolLogs`, `clearDevtoolErrors` |
| Docs | [devtools.md](./devtools.md) |

`openMapDevtoolsErrors` opens the panel on the Errors tab. `MapErrorToast` (from `@hungpvq/*-map-core/fields`) dispatches `hungpvq:map-open-devtools-errors`; stores listen and call `openMapDevtoolsErrors`.

Adapters do **not** re-export `@hungpvq/map-core` (`errorHandler` from map-core). See [Error handling](./error-handling.md).

## CSS

Documented `--map-*` tokens and theme classes (`map-theme-*`) in [CSS variables](./css-variables.md). `style.css` package entries are stable import paths.

## Experimental slot

Vue/React `@hungpvq/*-map-core` publish field/UI helpers on **`./fields`** (not the root barrel) — see [vue/react map-core](#hungpvqvue-map-core--hungpvqreact-map-core). They may change in a **minor**. Root `*_EXPERIMENTAL_RUNTIME_EXPORTS` for adapters are empty/reserved. Removing an Experimental export from a published barrel (including `./fields`) remains a **major**. Other map packages keep `*_EXPERIMENTAL_RUNTIME_EXPORTS` empty/reserved.
## Enforcing the allowlist

1. Edit `src/index.ts` with **named** exports only (no public `export *`). Prefer `export { X } from './internal-barrel'` (or from a feature module). Export first-party types with explicit `export type { … }` — never `export type *`, and never re-export third-party library types.
2. Put new implementation symbols in feature modules / `internal-barrel`; only promote to root `index.ts` + allowlist when intentional.
3. Update the matching `public-api.spec.ts` allowlist arrays (runtime symbols only).
4. Update this page when changing Stable.
5. Do not hand-edit package `CHANGELOG.md` unless asked — use release tooling.
