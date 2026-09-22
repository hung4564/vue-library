# Stable API (v1)

Allowlist of symbols and protocols we treat as **Stable** for SemVer on `1.x`.

Root and domain barrels use **explicit named exports** (no public `export *`). Root `src/index.ts` imports leaves directly (no `internal-barrel`). Runtime surface is locked by `public-api.spec.ts` (root **and** each domain subpath).

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

### Canonical imports

Prefer **domain subpaths** for feature APIs; use the root barrel for platform/runtime symbols (`getMap`, `MapStoreManager`, `UniversalRegistry`, …):

```ts
import { getMap, subscribeMapReady } from '@hungpvq/map-core';
import { createMeasurementSession } from '@hungpvq/map-core/measurement';
import { createIdentifySession } from '@hungpvq/map-dataset/identify';
import { createDrawSession } from '@hungpvq/map-draw';
```

Adapters (`@hungpvq/vue-*` / `@hungpvq/react-*`) must **not** re-export core protocol — import UI from adapters, protocol from core/dataset/draw.

### Export removal checklist (do not skip)

Before removing a published runtime export (Stable **or** Experimental on a barrel):

1. Classify Stable vs Experimental; confirm it is not a control/menu id, store key, CSS token, or protocol string.
2. Grep first-party map packages, demos, and docs. Tag: `in-use-first-party` | `docs-only` | `looks-unused-internal` | `unknown-external`.
3. **SemVer major** for any remove from a published barrel (Experimental included).
4. Update **together**: barrel `index.ts`, `*_STABLE_*` / `*_EXPERIMENTAL_*` in `public-api.spec.ts`, this page.
5. Prefer `@deprecated` alias for ≥1 minor when `unknown-external` or docs still reference the symbol.
6. **Forbidden:** delete an export only because “no monorepo import” without steps 3–4.

### Export inventory (hardening pass)

| Symbol | Package | Tag | Action |
|--------|---------|-----|--------|
| `logger` (root) | `@hungpvq/map-draw` | in-use-first-party (vue/react map-draw stores) | **Keep** Experimental |
| `brightColor`, `generateInspectStyle`, `renderPopup`, … | `@hungpvq/map-draw` | in-use-first-party | Keep (InspectControl) |
| `emptyDraftListSnapshot` | `@hungpvq/map-draw` | in-use-first-party | Keep (useDrawDrafts) |
| `cycleMapThemeMode` | `@hungpvq/map-core/theme` | in-use-first-party / docs | Keep |
| Inspect GIS helpers (`getSourcesFromMap`, …) | `@hungpvq/map-draw` | unknown-external | Keep (public Inspect extension surface) |

Related: [SemVer checklist](https://github.com/hung4564/vue-library/blob/main/libs/map-core/README.md#checklist-semver--breaking-change) · [Minimal starter](./minimal-starter.md) · [Peers and bundle](./peers-and-bundle.md) · [Map store](./map-store.md) · [Error handling](./error-handling.md) · [UniversalRegistry controls](./registry-controls.md) · [components](./registry-components.md)

## MapLibre-first

`MapSimple` is the Stable MapLibre map type. Platform APIs (`getMap`, `subscribeMapReady`, control helpers) take or return that instance — we do **not** hide MapLibre behind a custom engine facade. Apps may call MapLibre APIs on the instance directly.

## Thin-host controls

Dual Vue/React controls share **pure orchestration** in `@hungpvq/map-core` (root `controls/*` or domain subpaths), `@hungpvq/map-dataset`, or `@hungpvq/map-draw`. Adapters stay thin hosts (`useMap` + register/toolbar + SFC/JSX). Prefer `subscribeMapReady` when waiting for the map with cancel-on-unmount. Do not merge adapter packages or put framework UI into core.

Pure owners to copy (non-exhaustive):

| Area | Core helper |
|------|-------------|
| Shell controls | root `controls/*` (`captureHomeView`, `goHome`, navigation / globe / goto / setting / mouse-coordinates / info) |
| Identify session | `createIdentifySession` / `createIdentifyControlModel` (`@hungpvq/map-dataset/identify`) — session owns `runIdentifyMulti` + input modes; adapters are thin hosts |
| Measurement | `createMeasurementSession` / `createMeasurementMapView*` (`./measurement`) |
| Print advanced | `createPrintAdvancedSession` (`./print`) |
| Toolbar / CRS | `createLiveToolbarStrategy` (`./toolbar`), `normalizeDisplayEpsgs` (`./crs`) |
| Draw / inspect | `createDrawSession`, `draw-control-helpers`, `InspectController` (`@hungpvq/map-draw`) |
| Misc | `GeoLocateSession`, `createCopyFeedback`, theme / fullscreen helpers |

Hosts own UI, registry actions, and framework lifecycle only.

## Registry architecture

- **Host:** `UniversalRegistry` in `@hungpvq/map-core` — methods, menu handlers, components, control handles (one resolve path: map-scoped then global). Storage: `@hungpvq/shared-store` keys `map:registry:global` / `map:registry:maps` / `map:registry:controls` (no class-static `Map` singletons).
- **Adapters:** `@hungpvq/vue-map-core` / `@hungpvq/react-map-core` **extend** that class and only add typed `registerComponent` / `getComponent` (Vue also `markRaw`).
- Prefer `UniversalRegistry` / `runMapControlAction` from `@hungpvq/map-core` in framework-agnostic code (`map-dataset`, context menu).

## `@hungpvq/map-core` package entries

| Entry | Role |
|-------|------|
| `.` | Platform shell: store/`getMap`/`subscribeMapReady`, registry, errors, mitt, shared GIS utils, shell locales, host `WorkerMonitor`, thin-host control helpers (`captureHomeView`, `goHome`, navigation/globe/goto/setting/mouse-coordinates/info) |
| `./style.css` | Shared map CSS |
| `./assets/*` | Static assets (basemap thumbnails under `assets/basemap/`) |
| `./worker` | CSS/DOM-free worker helpers |
| `./basemap` | Basemap adapters, services, `INIT_BASEMAPS`, `createDefaultBaseMapStore`, `BasemapManager` / `getOrCreateBasemapManager` (on `MAP_STORE_KEY.BASEMAP`), `validateBasemapSource` / `createCustomBasemapItem` / `isCustomBasemapItem`, `getBasemapOpacityPaintKeys`, `BasemapError`, domain `logger` (`map:basemap`) |
| `./crs` | CRS catalog, store defaults, `CRS_CONTROL_LOCALE`, `createCoordinateFormatter`, `normalizeDisplayEpsgs`, domain `logger` (`map:crs`) |
| `./devtools` | Devtools store core: `getMapDebugStore` / `configureDevtoolLogStore` / `createDevtoolLogAdapter` / `getDevtoolLogDataStore` / `refreshDevtoolLogsFromStore` / `clearDevtoolLogsForMapId` / `clearDevtoolErrorsForMapId` (default uncapped IndexedDB; custom `LogDataStore` allowed; `removeMap` clears that map’s logs/errors), `installDevtoolsCore` (Experimental) |
| `./event` | `EventManager`, event models, bbox ranger, `createEventActionSync`, `groupEventsByMapType` / `isEventActive`, domain `logger` (`map:event`) |
| `./image` | Map image load/store helpers, domain `logger` (`map:image`) |
| `./legend` | `LegendService`, `MapLegend`, `buildLayerLegendElements`, paint helpers |
| `./measurement` | `MeasurementService`, measure modes, format helpers, `resolveMeasurementModeToggle` / `resolveMeasurementToolbarStatus`, `createMeasurementSession`, `createMeasurementMapView` / `createMeasurementMapViewLayers`, `draftCoordinatesToFeature` / `buildMeasurementGeojsonDownload`, domain `logger` (`map:measurement`) |
| `./menu` | Map context menu builders / actions |
| `./print` | `PrintService`, export helpers (`exportMapbox*`, `printMapToFile`, `clipCanvasRegion`, `waitMapIdleAndTiles`), `createPrintAdvancedSession` / `DEFAULT_PRINT_ADVANCED_SETTING`, domain `logger` (`map:print`) |
| `./theme` | Theme bootstrap / resolve / `MAP_THEME_*`, `MAP_THEME_CONTRAST_CLASS`, `subscribePrefersContrastMore`; optional per-map helpers `resolveMapThemeElement` / `applyMapThemeClassToElement` / `applyMapThemeForMap` (document theme remains default) |
| `./toolbar` | Toolbar strategies / store APIs, `createLiveToolbarStrategy`, domain `logger` (`map:toolbar`) |

### Root (`.`) highlights

Runtime allowlist: `MAP_CORE_STABLE_RUNTIME_EXPORTS` in `public-api.spec.ts` (~80 symbols).

| Area | Stable surface |
|------|----------------|
| Map access | `getMap` → `MapSimple \| undefined`, `subscribeMapReady` → unsubscribe, `registerMapAccessor` (+ `{ hostId }`, returns unregister), `registerMapReadySubscriber`, `registerMapStoreCleanup`, `MAP_PLATFORM_HOST`, `listMapPlatformHosts`, `MAP_PLATFORM_REGISTRY_METHOD` (reserved UniversalRegistry global keys), `MapStoreManager`, `MAP_STORE_KEY`, `hasMapInstance`, `registerMapDomainStoreFactory` / `ensureMapDomainStore` / `hasMapDomainStoreFactory` (domain bags on `map:core[mapId]`; not `meta.registries`), `ensureMapMitt` / `ensureMapLangStore` / `ensureMapLocaleApi` — [map-store](./map-store.md). Domain subpaths also export `ensureMap*Store` / `ensureMap*Api` (event, image, toolbar, crs, print, basemap). **Theme bootstrap is process-global** (one `html` theme); platform accessors are **multi-host**. |
| Thin-host control helpers | Home (`captureHomeView` / `goHome`), navigation (`zoomIn` / `zoomOut` / `resetBearing` / `attachRotateListener` / …), globe (`toggleGlobeProjection` / …), goto / setting / mouse-coordinates / info attach helpers |
| Registry | `UniversalRegistry`, `runMapControlAction`, `buildMapControlHandle`, `MapControlHandle`, `REGISTRY_*` (incl. `REGISTRY_GLOBAL_STORE_KEY` / `REGISTRY_MAPS_STORE_KEY` / `REGISTRY_CONTROLS_STORE_KEY`), `filterMapControls` (`RegistryFn` = `(...args: unknown[]) => unknown`) — backed by `@hungpvq/shared-store` |
| Init / errors | `MapInitializer`, `MapError` family, `errorHandler` / `MapErrorHandler` — [error-handling](./error-handling.md) |
| A11y | `bindMapKeyboardShortcuts`, `closeTopOpenMapControl`, `focusMapLayerSearch`, `MAP_LAYER_SEARCH_SELECTOR`, `mapLayerSearchSelector` |
| Shared GIS | `fitBounds` (sidebar left/right padding), `bboxFromGeojson`, `isValidBbox`, `reprojectGeojson`, `reprojectGeojsonToWgs84`, coordinate/DMS helpers (`parseCoordinateText`, `latDMS`/`lngDMS`), color (`getChartRandomColor`, `getChartColorAt`) / `logHelper`, map-info (`copyImageDataUrl`) |
| Pointer / touch | `getMapPointerProfile`, `bindMapLongPress` |
| Fullscreen | `requestElementFullscreen`, `exitDocumentFullscreen`, `toggleElementFullscreen`, `subscribeFullscreenChange`, `getFullscreenElement`, `isDocumentFullscreen`, `isMapRootFullscreen`, `resolveMapFullscreenTarget` |
| Control layout | `resolveControlLayout`, `ResolvedControlLayout` (`standalone` / `toolbar` / `menu`), `ControlLayout` (`standalone` / `toolbar` / `button`), `ButtonInMobile` / `BUTTON_IN_MOBILE_VALUES` (`button` / `toolbar` / `menu`). Map `buttonInMobile` on viewports ≤640px: `button` leaves corner controls unchanged; `toolbar` promotes into one `ToolbarControl` host except `controlLayout="button"`; `menu` fans out by `position` into corner stacks with outside-in overflow; bottom half budgets menu + same-edge `controlLayout="button"` chrome (see [ToolbarControl](./module/ToolbarControl.md)). Mount `ToolbarControl` in the map slot for `toolbar` and `menu`. |
| Button chrome helpers | `MAP_BUTTON_VARIANTS` / `MAP_BUTTON_SIZES` / `MAP_BUTTON_SIZE_PX`, `resolveMapButtonSizePx`, `mapButtonVariantClass`, `mapButtonSizeClass`, … (used by Vue/React `MapControlButton`) |
| ModuleContainer helpers | `moduleCornerHostSelector` / `moduleDraggableHostSelector` (+ id variants), `buildModuleBindPosition`, `moduleBtnContainerClassName`, `isModuleCornerChromeVisible`, `queryModuleHostElement` (Vue/React `ModuleContainer`) |
| Worker host | `WorkerMonitor` (+ `abortTask`), `connectWorkerMonitor`, `abortWorkerMonitorTask`, `createWorkerMonitorAbortMessage`, `runMonitoredTask`, `workerHasHistory` / `anyWorkerHasHistory` / `countBusyWorkers`, `createWorkerUiDelayState` (WorkerControl busy/loading anti-flicker), … (in-worker: `./worker`) |
| Shell locales | `MAP_ACTION_*`, Home/Goto/Globe/Info/Setting, `WORKER_*`, `REGISTRY_*`, `LANGUAGE_*`, `MAP_CORE_LOCALE_EN`, `MAP_CORE_LOCALE_VI`, `registerMapCoreBuiltinLocales` |
| Lang API | `registerLocale` / `registerLocaleFlat` / `setLanguage` / `loadLocale` / `MAP_BUILTIN_LANGUAGES` / flat helpers (via `createMapLocaleApi` + root exports); domain logger `mapLangLogger` (`map:lang`); built-in packs auto-register on first `ensureMapLocaleApi` |
| Types | `MapSimple`, `WithMapPropType`, `ControlLayout`, `MapControlHandle`, … |

Domain APIs (**theme, basemap, measurement, …**) are **not** on the root barrel — import from the matching subpath.

Toolbar helpers on `@hungpvq/map-core/toolbar`: `mdiIcon`, `mdiButtonState`, `compassIcon`, `createLiveToolbarStrategy`; overflow helpers `groupToolbarButtons`, `splitToolbarOverflow`, `splitToolbarOverflowKeepGroups` (`prefer` `'start'`|`'end'`, `toolbarGroupHeightCost`), `maxVisibleToolbarButtons`, `maxVisibleButtonsInStackHeight`, `cornerVerticalMenuBudgetsPx`, `measureCornerStandaloneReserved`, `measureCornerMenuUsedPx`, `elementOuterSize`, `toolbarAvailableWidth`, `toolbarGroupHeightCost`, `toolbarOverflowPanelClassName`, `planToolbarLayout`, `TOOLBAR_EDGE_INSET_PX`, `TOOLBAR_STACK_GAP_PX`, `BUTTON_GROUP_OVERFLOW_FRACTION`, `TOOLBAR_CONTROL_LOCALE`.

## `@hungpvq/map-dataset`

**Breaking major:** domain symbols moved off the root onto named subpaths. Root no longer re-exports builders, identify, menu, style, create-control, geo-export, or attribute-table APIs. Full runtime allowlists: `public-api.spec.ts` (root + each subpath).

| Entry | Stable surface (highlights) |
|-------|-----------------------------|
| `.` | `DatasetService`, `MAP_DATASET_STORE_KEY` / `ensureMapDatasetStore` / `createDefaultMapDatasetStore` / `notifyMapDatasetStore` (domain bag on `map:core[mapId]`), tree/`createRootDataset`/`createGroupDataset`, `convertListToTree` / `convertTreeToList` / `mergeEmptyGroups` / `createDefaultGroup` / `isGroupNode`, layer-list types (`LayerListItem` / `LayerListTreeNode` / `LayerListGroupTree` / `ListViewGroupRef` / `IListViewUI` / `IGroupListViewUI`), `getLayerControlTitleMenuState` / `registerAddGeojsonHereForMap`, generic parts, layer/dataset locales, `createDataManagement` / `isDataManagementView`, `warnIfDatasetRegistryMissing` / `resetDatasetRegistryWarnFlag`, `IDataset` (+ shared protocol types). Experimental: `upsertDatasetComponent` / `removeDatasetComponent`, `logger` / `loggerIdentify` / `loggerHighlight` |
| `./highlight` | `createHighlightPart`, `getHighlightController` / `destroyHighlightController` / `bindHighlightPickDatasets`, dataset UI mitt (`MAP_DATASET_EVENT`, `MapDatasetClosePayload` `{ mapId, item?, dataset? }`, `MapDatasetClearPayload` `{ mapId, target, dataset? }`, `bindHighlightMittBridge` / `releaseHighlightMittBridge` / `cleanHighlightMittBridge`·`destroyHighlightMittBridge`, `emitHighlight*`), cascade defaults (`DEFAULT_HIGHLIGHT_*`); types `HighlightPartOptions`, `HighlightController`, `IHighlightPart`, `MapDatasetEvent`, … (cascade/query/resolve + paint-layer helpers are package-internal) |
| `./attribute-table` | `ATTRIBUTE_TABLE_*`, `createAttributeTableController` / stores (+ optional `invalidate`), `createDatasetPartAttributeTable` (`columns` / `ui`), `createMenuItemAttributeTable`, column/sort helpers, `resolveAttributeTable*Option`, `AttributeTableProps` / view / toolbar / pager / grid props |
| `./geojson` | `createGeoJsonDataset`, `createGeojsonHereDataset`, `ensureGeojsonFeatureIds` / `GEOJSON_FEATURE_ID_KEY` (auto `_id` + `promoteId` for Identify↔table), geojson source/parse/worker (`configureGisWorker`, `resolveGisWorkerUrl`, `terminateGeojsonWorker`, …), `GEOJSON_STYLE_AUTO` |
| `./data-management` | `createDataManagement`, `createLocalStore`, `createHttpStore`, `createDataManager`, `toRecord` / `toFeature` / `toFeatureCollection`, `isDataManagementView` |
| `./raster` | `createRasterUrlDataset`, raster source part, `RASTER_XYZ_SAMPLES` |
| `./vector-tile` | `createVectorTileDataset` / `VectorTileDatasetOption`, `createDatasetPartVectorTileComponent`, `VECTOR_SAMPLES` / `VECTOR_TILE_SAMPLES` / `TILEJSON_SAMPLES`, local archive tile URLs `mbtilesLocalTilesUrl` / `pmtilesLocalTilesUrl` (`mbtiles-local://` / `pmtiles-local://` via `ensureVectorTileProtocols`), vector-tile worker (`configureVectorTileWorker`, `openMbtilesArchive` / `openPmtilesUrl` / `openPmtilesFile`, …) |
| `./identify` | `IDENTIFY_*`, `createDatasetPartIdentify*`, `handleMultiIdentify*`, `runIdentifyMulti` / `runIdentifyShowFirst` (+ layer-filter / result-panel helpers), `createIdentifySession` / `createIdentifyControlModel` / scoped-session helpers, scope helpers, `resolveIdentifyHitAction` / `onSingle`·`onMultiple` builder, `createDefaultIdentifyResolver` / `setIdentifyResolver` / `getIdentifyResolver`, `createIdentifyFeatureResolver` / `resolveIdentifyFeatures` (getFeature → source → rendered → `Feature[]`), highlight session (`paintHighlight` / `paintHighlights` / `clearHighlight` / `onDetailClose` / `onIdentifyClose` / `paintIdentifyResultFocus` / `syncIdentifyPointerPick`), `createDefaultHighlightResolver` / `setHighlightResolver` / `getHighlightResolver` / `runHighlightFromRecords`; types `IIdentifyView*`, `IdentifyFeatureRow`, `IdentifyMultiResult`, `IdentifyHitAction`, `HighlightSessionIntent`, `HighlightContext` (canonical result row shape; former `IdentifySingleResult` / `IdentifyResult` aliases removed) |
| `./menu` | `LIST_VIEW_MENU_*`, `createMenu*` (list-view / dataset builders), `createMapContextMenuBuilder`, `createLegend` / `createMultiLegend`, `handleMenuAction*`, `runFitBoundsMenuAction` / `resolveFitBoundsMenuTarget` (camera-only — never paints highlight), menu part builders; `MenuItem*` / `MenuAction` / `MenuItemProps` payload `P` defaults to `unknown` (types-only tightening vs former `any`) |
| `./style` | `LayerSimpleMapboxBuild`, `LayerRasterMapboxBuild`, `*_CONFIG`, `TABS`, `CONFIG_TAB_BASE` / `buildConfigTabs`, `applyStyleTabValue` / `applyStyleZoom`, `STYLE_CONTROL_LOCALE` |
| `./create-control` | `CREATE_CONTROL_*`, `LAYER_TYPES` / `LayerHelper` / `Config*Helper` (incl. `ConfigTilejsonHelper`, `ConfigFilegdbHelper`) / `createLayerFormHelper` / `normalizeLayerType`, `assertCreateControlFileSize` / `formatCreateControlBytes` / `CREATE_CONTROL_MAX_FILE_BYTES`, `parseGis*` / `loadGis*` / upload helpers (`looksCompleteGis`, `parseCreateControlUploadedFiles`, `collectFilesFromDataTransfer`, `collectFileGdbFilesFromDataTransfer`, `readClipboardGisPaste`, `loadCreateControlTileJsonFromUrl` / `tileJsonToCreateControlPatch`, `summarizeFileGdbLayerMeta`, `createControlGeojsonPreviewPatch`, …), `configureFileGdbGdal` / `featuresWithGeometry`, `getCreateControlSamples` / `applyCreateControlSample` — GIS format peers (`shpjs`, `papaparse`, `@tmcw/togeojson`, `jszip`, `topojson-client`, `@xmldom/xmldom`, `gdal3.js`) and archive peers (`pmtiles`, `sql.js`) are **optional**; install when using CreateControl / file parse — [peers-and-bundle](./peers-and-bundle.md). CreateControl data kinds: `geojson` \| `filegdb` \| `xyz` \| `tilejson` \| `mbtiles` \| `pmtiles` (legacy `vector` / `rasterxyz` / `vectortile` / `raster` normalize via `normalizeLayerType`; samples use `layerKind` only) |
| `./geo-export` | `GEO_EXPORT_*` / `GEO_EXPORT_COMPONENT_KEY` (SoT; `LIST_VIEW_MENU_COMPONENT_KEY.exportGeo*` aliases), `createGeoExportController`, `onExport` + `GeoExportContext` (+ `AbortSignal`), `uiMode` modal\|menu\|click, `formComponent` / `loadingComponent`, `resolveGeoExportUiSlot`, `resolveExportCollection`, active-source bridge, `createMenuItemExportGeo`, `createDatasetPartGeoExport`, `openGeoExportModalFromAttributeTable` / `runGeoExportClickFromAttributeTable` / `runGeoExportFormatFromAttributeTable`, `resolveGeoExportCrs`, `downloadBlob` / `sanitizeExportFilename`, `getDatasetFeatureCollection` / `hasGeojsonExportData`, `ExportGeoComponentAttrs` (`exportHandler`) |
| `./vite` | `mapDatasetGisWorker()` — Vite optimizeDeps + maplibre named-export shim for published package consumers |
| `./geojson-worker` | Static single-file GIS worker (`assets/geojson.worker.js`) for Webpack / CDN / static hosts |
| `./style.css` / `./assets/*` | package CSS and static assets |

`LIST_VIEW_MENU_ID` / `LIST_VIEW_MENU_COMPONENT_KEY` **string values** remain SemVer-stable (import from `@hungpvq/map-dataset/menu`).

Map context menu ids, built-in item builders, and types (`MAP_CONTEXT_MENU_ID`, `createMapMenuBuilder`, `createDefaultMapContextMenuItems`, `MapContextMenuTarget`, …) import from `@hungpvq/map-core/menu` — not re-exported from `@hungpvq/map-dataset/menu`.

## `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`

Root barrels are **Stable only** (see each `public-api.spec.ts`). Field / lightweight UI helpers live on **`./fields`** (Experimental; may change in a **minor**).

**Breaking (major):** importing former Experimental symbols (`Input*`, `MapCard`, `MapErrorToast`, …) from the package root fails — use `@hungpvq/vue-map-core/fields` / `@hungpvq/react-map-core/fields`. Former `BaseButton` is removed — use Stable root `MapControlButton`.

Shared root highlights:

| Area | Stable surface |
|------|----------------|
| Shell | `Map` container; dual events **`mapLoaded` / `mapDestroy` / `error`** — Vue `@mapLoaded` / `@mapDestroy` / `@error`, React `onMapLoaded` / `onMapDestroy` / `onError`; optional `keyboardShortcuts` (default true); mounts `MapErrorToast` internally from `./fields`. Shell MapLibre defaults from `MapInitializer.createDefaultOptions` (`attributionControl: false`, …) |
| Hooks | `useMap`, `useMapInstance`, `useShow`, `useRegisterMapControl`, `useUniversalRegistry` |
| Store helpers | `createMapScopedStore`, `destroyMapScopedStore`, `getStore`, `addStore`, `isUsableMapId` (not `getMap`) — [map-store](./map-store.md) |
| Registry | Framework `UniversalRegistry`, `RegistryItem` |
| Controls | ModuleContainer controls + **control ids** / action types ([registry-controls](./registry-controls.md)); both export `ActionControl`; action UI uses `MapControlButton` (`variant`: `icon` \| `plain` \| `text` \| `tonal` \| `outlined` \| `filled`; `size`: `small` \| `medium` \| `large` \| number px — see [css-variables](./css-variables.md#core---mapcontrolbutton--mapbutton)) / `MapCommonButton` / **`MapCopyButton`** (clipboard + icon feedback; see [css-variables](./css-variables.md#core---mapcopybutton)) |
| Types | First-party: `WithShowProps`; prefer `WithMapPropType` / `MapSimple` from `@hungpvq/map-core` |

Framework idioms (Stable, **not** dual-export parity): Vue `makeShowProps` / `withMapProps`; React `MapContext` / `MapContextProvider` / `useMapContext` / `ReactMapStoreAdapter` / `MapControlButtonGroupContext`. Do not expect these on the other adapter. React also exports imperative `getMapMittStore` (same as `useMapMittStore`) for non-hook call sites — rules-of-hooks. Root bag: `getMapCoreRootStore` / `MAP_CORE_ROOT_STORE_KEY` on `@hungpvq/map-core`.

Package entries: `.` + `./style.css` + **`./fields`**.

### `@hungpvq/vue-map-core/fields` / `@hungpvq/react-map-core/fields`

| Symbol | Notes |
|--------|--------|
| `BaseCollapse`, `Collapse` | Collapse panel — **canonical `BaseCollapse`**; `Collapse` alias |
| `InputCheckbox`, `InputChoose`, `InputColorPicker`, `InputCrs`, `InputFile`, `InputSelect`, `InputSlider`, `InputText`, `InputTextArea`, `InputTextarea` | Form helpers — **canonical `InputTextArea`**; `InputTextarea` alias |
| `MapButton` | Map-control chrome (`variant` / `size` same as `MapControlButton`; prefer Stable root `MapControlButton` in apps) |
| `MapCard`, `MapIcon`, `MapImage` | Lightweight map UI primitives |
| `MapErrorToast` | Listens to `errorHandler`; “Open errors” dispatches `hungpvq:map-open-devtools-errors` |
| `DragDropFile` | Vue + React `/fields` (DOM-only drop zone) |

```ts
import { MapControlButton, MapCopyButton } from '@hungpvq/vue-map-core';
import { InputText } from '@hungpvq/vue-map-core/fields';
// or `@hungpvq/react-map-core` / `.../fields`
```

`MapControlButton`: `variant` + `size` (`small` \| `medium` \| `large` \| px). Prefer `size="small"` in dense layer rows; default `medium` matches draggable header chrome (32px).

`MapCopyButton`: Stable root copy action — wraps `MapControlButton` + core `createCopyFeedback`. On success, icon `mdiContentCopy` → `mdiCheck` and title → `copiedTitle` for ~1.5s (`COPY_FEEDBACK_MS`). **No toast.** Prefer this for every text-copy chrome button (InfoControl rows, LayerDetail cells, measurement CRS values, …).

Prefer canonical names in new code (`MapControlButton`, `MapCopyButton`, `BaseCollapse`, `InputTextArea`). Authoritative lock: root Stable + `*_FIELDS_RUNTIME_EXPORTS` in each adapter `public-api.spec.ts`.

**Parity lock:** `libs/map-core/core/src/dual/parity-catalog.ts` + `vue-react-parity.spec.ts` (shared control ids + shared Stable root + shared `/fields` Experimental names).

Dataset / draw Experimental allowlists are **empty / reserved**. `@hungpvq/map-core` Experimental root: `GeoLocateSession` (Mapbox-style geolocate engine used by Vue/React `GeoLocateControl`; may change in a **minor**); `DEVTOOLS_CONTROL` (shared Map-scoped Devtools control id; may change in a **minor**). `@hungpvq/map-core/devtools` also exports Experimental `formatDevtoolsLogEntryForCopy` for LogViewer clipboard formatting.

Adapters do **not** re-export `@hungpvq/map-core` protocol (`getMap`, `errorHandler`, …). There is no adapter `handleError` — apps use `errorHandler` from `@hungpvq/map-core`.

## `@hungpvq/vue-map-dataset` / `@hungpvq/react-map-dataset`

| Area | Stable surface |
|------|----------------|
| Bootstrap | `installMapApp`, `createMapAppPlugin` (Vue), `createDatasetRegistryPlugin()` |
| Hooks | `useMapDataset` (incl. `datasetVersion`), `useMapHighlight` |
| UI | `LayerControl`, `IdentifyControl`, `IdentifyResultControl`, `IdentifyShowFirstControl`, `AttributeTable` (+ `AttributeTableView` / toolbar / grid / pager), `StyleControl`, `CreateControl`, `ComponentManagementControl`, `DatasetDetail`, `LayerMenuDefaultHandle`, … |
| Core boundary | Builders/services/types from `@hungpvq/map-dataset` (including `createLegend` / `createMultiLegend` from `@hungpvq/map-dataset/menu`) |

Menu condition: Vue `provideMenuConditionContext` / `MENU_CONDITION_CONTEXT_KEY`; React `MenuConditionProvider`. Imperative bag access: `getMapDatasetStore` / `notifyMapDatasetStore` (adapters + `@hungpvq/map-dataset`). UI list refresh: depend on `useMapDataset().datasetVersion` — see [useMapDataset](/map/dataset/helper/useMapDataset).

## `@hungpvq/map-draw`

| Area | Stable surface |
|------|----------------|
| Service | `DrawService` |
| Protocol | `DrawingType`, `DrawingTypeName`, `MAP_DRAW_EVENT`, `MAP_DRAW_STORE_KEY`, `MapDrawOption`, `MapDrawEndPayload` `{ mapId }`, `isDraftOption`, `ensureMapDrawStore` / `createDefaultMapDrawStore` |
| Engine mount | `MapDraw`, `StaticMode`, `DRAW_MODES`, `getDrawStyles` |
| Styles / query / ids | `getFeatureByMap`, `getFirstFeatureByMap`, `getFeatureId`, `sameFeature` |
| Locales | `DRAW_CONTROL_LOCALE`, `INSPECT_CONTROL_LOCALE` |
| Experimental (`@hungpvq/map-draw`) | `createDrawSession` (`prepareSave` / `finishCancel` / `redrawNonDraft`, …), `draw-control-helpers` (`handleDrawMapClick`, …), `logger` |

Inspect helpers (`brightColor`, `generateInspectStyle`, …) remain public; inventory tagged `in-use-first-party` via InspectControl.

## `@hungpvq/vue-map-draw` / `@hungpvq/react-map-draw`

| Area | Stable surface |
|------|----------------|
| Shell | `DrawControl`, `InspectControl` (shared `InspectController`), `useMapDraw`, `useConfigDrawControl`, `useMapDrawStore` |
| Control ids | `mapDrawDraftList`, `mapInspectControl` |
| Core boundary | Protocol / `isDraftOption` / locales from `@hungpvq/map-draw` — adapters do **not** re-export them |

Consumer docs: `libs/map-core/map-draw/docs` → `/map/draw/`.

## `@hungpvq/vue-map-devtools` / `@hungpvq/react-map-devtools`

| Area | Stable surface |
|------|----------------|
| Bootstrap (both) | `installDevtools` / `uninstallDevtools` (`installDevtools({ logStore })`: `'indexeddb'` \| `'memory'` \| options \| custom `LogDataStore`) |
| Panel | `Devtools` (mount **inside** `<Map>`; `DraggableItemPopup`) |
| Map control | `DevtoolsControl` / `DEVTOOLS_CONTROL.id` (`mapDevtools`) — same popup path |
| Open helpers | `openMapDevtoolsErrors`, `setDevtoolOpen`, `toggleDevtoolOpen`, … |
| Store helpers (both) | `DevtoolLogAdapter`, `devtoolLogAdapter`, `devtoolState`, `getDevtoolState`, `useDevtoolState`, `subscribeDevtoolState`, `toggleDevtoolOpen`, `setDevtoolActiveTab`, `clearDevtoolLogs`, `clearDevtoolErrors` |
| Docs | [devtools.md](./devtools.md) |

`openMapDevtoolsErrors` opens the panel on the Errors tab. `MapErrorToast` (from `@hungpvq/*-map-core/fields`) dispatches `hungpvq:map-open-devtools-errors`; stores listen and call `openMapDevtoolsErrors`.

Adapters do **not** re-export `@hungpvq/map-core` (`errorHandler` from map-core). See [Error handling](./error-handling.md).

## CSS

Documented `--map-*` tokens and theme classes (`map-theme-*`) in [CSS variables](./css-variables.md). `style.css` package entries are stable import paths.

## Experimental slot

Vue/React `@hungpvq/*-map-core` publish field/UI helpers on **`./fields`** (not the root barrel) — see [vue/react map-core](#hungpvqvue-map-core--hungpvqreact-map-core). They may change in a **minor**. Root `*_EXPERIMENTAL_RUNTIME_EXPORTS` for adapters are empty/reserved. Removing an Experimental export from a published barrel (including `./fields`) remains a **major**. `@hungpvq/map-core` Experimental: `GeoLocateSession`, `DEVTOOLS_CONTROL`. Other map packages keep empty/reserved experimental lists.
## Enforcing the allowlist

1. Edit `src/index.ts` with **named** exports only (no public `export *`). Prefer `export { X } from './feature/leaf'`. Export first-party types with explicit `export type { … }` — never `export type *`, and never re-export third-party library types.
2. Put new implementation symbols in feature modules; only promote to root `index.ts` + allowlist when intentional.
3. Update the matching `public-api.spec.ts` allowlist arrays (runtime symbols only).
4. Update this page when changing Stable.
5. Do not hand-edit package `CHANGELOG.md` unless asked — use release tooling.
