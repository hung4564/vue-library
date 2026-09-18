# Vue Library — System Architecture & Runtime Flows

> Reverse-engineered from **implementation** in this workspace (Nx monorepo `@hungpvq/*`).  
> Confidence tags: **VERIFIED** (from source), **INFERRED** (from call/dep graph), **UNKNOWN** (outside repo).  
> If package docs conflict with code, **code wins**; outdated docs are called out.

---

# 1. Executive Summary

## What this workspace is

An **Nx TypeScript monorepo** that publishes npm packages under `@hungpvq/*` for:

1. **Map SDK** — MapLibre GIS maps with dual **Vue 3** and **React** adapters on framework-agnostic cores (`map-core`, `map-dataset`, `map-draw`).
2. **Draggable UI** — floating/sidebar shell used by map panels and standalone demos (`draggable` + vue/react adapters).
3. **Share infrastructure** — process-wide store (`shared-store`), logging (`shared-log`), utilities (`shared`, `shared-core`, `shared-file`).
4. **Demos / docs / CI** — Vue/React demo apps, VitePress docs, GitHub Actions CI + Publish on tags.

## Main capability groups (product view)

| Group | Consumer-facing capability |
|-------|----------------------------|
| Map shell | Create/destroy MapLibre map per `mapId`, toolbar, registry, theme, language |
| Dataset / layers | Build datasets, list/reorder layers, style, menus, attribute table, export |
| Identify | Click/box query features → result panel / menus / highlight |
| Measurement | Distance / area / angle / radius sessions on the map |
| Draw / inspect | Sketch/edit GeoJSON via Mapbox Draw; inspect layers |
| Draggable chrome | Sidebar/popup/float panels hosting map controls |
| Devtools | Store/log/error viewers (dev) |

## Architecture in one paragraph

**VERIFIED:** Apps call `installMapApp` → optional theme bootstrap + dataset registry components. Mounting `<Map mapId>` constructs MapLibre, registers a **process-global** `getMap` accessor (last-writer-wins), and stores the instance in **per-`mapId`** `MapStoreManager`. Controls register with `UniversalRegistry` per map, use scoped stores (`MAP_STORE_KEY.*`, plus `'dataset'` / `'draw'`), and push GIS orchestration into core **sessions** (`createMeasurementSession`, `createIdentifySession`, `createDrawSession`). Vue/React packages are thin hosts (UI + EventClick + toolbar).

```text
Consumer app
    ↓
installMapApp + <Map>
    ↓
┌─────────────────────────────────────────┐
│ shared-store ($_hungpv_store)           │
│ shared-log / UniversalRegistry global   │
└─────────────────────────────────────────┘
    ↓
map-core (engine, store, theme, registry)
    ↓
map-dataset / map-draw (domain sessions)
    ↓
vue-map-*  OR  react-map-*  (+ vue/react-draggable)
    ↓
MapLibre GL + @mapbox/mapbox-gl-draw
```

**No first-party backend** in this workspace — network calls (if any) live in consumer apps / demo loaders (**UNKNOWN** beyond demos).

---

# 2. Workspace Architecture

## 2.1 Inventory (VERIFIED from `project.json` / `package.json`)

| Layer | Packages / projects |
|-------|---------------------|
| Map core | `@hungpvq/map-core`, `map-dataset`, `map-draw`, `map-debug` |
| Map Vue | `vue-map` (meta), `vue-map-core`, `vue-map-dataset`, `vue-map-draw`, `vue-map-devtools` |
| Map React | `react-map` (meta), `react-map-core`, `react-map-dataset`, `react-map-draw`, `react-map-devtools` |
| Draggable | `@hungpvq/draggable`, `vue-draggable`, `react-draggable` |
| Share | `shared`, `shared-core`, `shared-store`, `shared-log`, `shared-file`, `router` |
| UI | `ui-core` |
| Fixtures | `demo-map-datasets` (private) |
| Apps | `vue-demo-map`, `react-demo-map`, `demo-draggable`, `react-demo-draggable`, e2e apps |
| Docs / CI | `docs/` VitePress; `.github/workflows/ci.yml`, `publish.yml` |

~29 Nx projects; release groups: **map**, **draggable**, **packages**.

## 2.2 Dependency direction (VERIFIED from package.json)

```text
shared-store / shared-log / shared
            ↑
       map-core
        ↑     ↑      ↑
 map-dataset  map-draw  map-debug (devtools SoT + dataset bridge)
        ↑     ↑      ↑
   ┌────┴─────┴──────┴────┐
vue-map-core    react-map-core   ← peer vue/react-draggable
   ↓                ↓
vue-map-dataset  react-map-dataset
vue-map-draw     react-map-draw
vue-map-devtools react-map-devtools  ← import map-debug CSS + Dataset UI

vue-map / react-map  ← meta bag (deps → stack above; peer framework + maplibre)

draggable ← vue-draggable | react-draggable
```

- Cores: **no** `vue`/`react` imports in `src/` (**VERIFIED** prior audits).
- Adapters must **not** re-export core protocol (skill + public-api pattern).

## 2.3 Framework vs independent

| Independent | Framework-specific |
|-------------|-------------------|
| `map-core`, `map-dataset`, `map-draw`, `map-debug`, `draggable`, share packages | `vue-*`, `react-*` adapters, demos |

## 2.4 Build / CI (VERIFIED)

- Scripts: `map:lint|build|test|dev-vue|dev-react|release`, `draggable:*`, `share:build`, `docs:*`.
- CI: checkout → `npm ci` → Nx (on `master` / PR).
- Publish: tags `map@*`, `draggable@*`.

---

# 3. Feature Inventory

## 3.1 Core (map platform)

| Feature | Entry | Package |
|---------|-------|---------|
| Bootstrap app | `installMapApp` | vue/react-map-dataset |
| Create / destroy map | `<Map>` / `useMapInstance` | vue/react-map-core |
| getMap / READY | `registerMapAccessor`, `subscribeMapReady` | map-core + adapter store side-effect |
| Control registry | `useRegisterMapControl`, `UniversalRegistry` | map-core |
| Theme | `bootstrapMapTheme`, `ThemeControl`, opt-in `applyMapThemeForMap` | map-core / adapters |
| Language | `LanguageControl`, lang store | map-core adapters |
| Toolbar | `ToolbarControl`, `useToolbarControl` | adapters |
| Context menu | `MapContextMenuControl` | adapters + map-core/menu |
| Errors | `errorHandler` singleton | map-core |

## 3.2 Map chrome controls (dual ids — VERIFIED `MAP_DUAL_CONTROL_IDS`)

Home, Zoom, Navigation, Fullscreen, Globe, GeoLocate, Goto, Info, Setting, Theme, Language, CRS, Legend, Basemap (+ tags), Print (+ advanced), Worker, Registry, Mouse coordinates, Event management, Measurement (+ setting), Layer, Dataset, Create, Identify, Draw (+ draft list), Inspect, Attribute table, …

## 3.3 Dataset domain

| Feature | Core owner |
|---------|------------|
| Dataset tree add/remove | `DatasetService` |
| Layer list / reorder | `syncListViewLayerOrder` |
| Menus / conditions | map-dataset/menu |
| Style editor | style helpers + StyleControl UI |
| Identify session | `createIdentifySession` |
| Highlight | highlight controller |
| Attribute table / export | attribute-table / geo-export |
| GeoJSON here | `registerAddGeojsonHereForMap` |

## 3.4 Draw domain

| Feature | Core owner |
|---------|------------|
| Draw session | `createDrawSession` |
| Save/cancel prelude | `prepareSave` / `finishCancel` |
| Persist | `DrawService` |
| Inspect | `InspectController` |

## 3.5 Draggable

| Feature | Owner |
|---------|-------|
| Container init | `useDragContainer` / `drag:core` store |
| Sidebar / popup / float items | vue/react-draggable shells |
| Used by map | `DraggableItemSideBar` panels |

## 3.6 Infrastructure

| Feature | Owner |
|---------|-------|
| Process store | `GlobalStoreService` → `globalThis.$_hungpv_store` |
| Logging | `loggerFactory` → `globalThis.__hungpvq_LoggerFactory__` |
| GIS worker | map-dataset geojson worker config |

---

# 4. Feature Flow (critical paths)

## Feature: Map bootstrap + create map

### Purpose
Initialize theme/registry once; create a MapLibre map bound to `mapId`.

### Entry
- Dev: `installMapApp(app)` (Vue) / `installMapApp()` (React) — **VERIFIED** `libs/*/map-dataset/src/plugin/index.ts`
- UI: `<Map map-id="…" />`

### Flow (VERIFIED)

```text
1. installMapApp
   → bootstrapMapTheme() unless theme:false
        → localStorage MAP_THEME_STORAGE_KEY → html.map-theme-*
   → createDatasetRegistryPlugin → UniversalRegistry.registerComponent (global UI keys)
2. Import adapter store (side effect of Map/controls)
   → registerMapAccessor(getMap impl)          [PROCESS-GLOBAL, last-writer]
   → registerMapReadySubscriber
   → registerMapStoreCleanupRegistrar
3. Map mounts → useMapInstance
   → new maplibre Map
   → useMapContainer(id).initMap(map)
        → MapStoreManager.initMap
        → emit MAP_CORE_EVENT.READY
4. Child controls useMap → subscribeMapReady → callMap(fn)
5. Unmount / removeMap
   → runCleanup(mapId) → UniversalRegistry.clearMap → delete store entry
   → tombstone removedMapIds (process meta store)
   → MapLibre remove
```

### State
- Per-map: `MapStoreManager.root[mapId].map`
- Process: platform methods, theme on `html`, tombstones `map:core:meta`

### Side effects
Theme CSS classes; global component registry; READY mitt.

### Potential issues
- Accessor **last-writer-wins** if Vue+React both load (**VERIFIED**).
- Theme **not** per-map by default; `applyMapThemeForMap` is opt-in API with no ThemeControl caller (**VERIFIED**).

---

## Feature: LayerControl — add / reorder layers

### Entry
`<LayerControl />` after Map READY.

### Flow (VERIFIED)

```text
Mount LayerControl
 → useRegisterMapControl('mapLayerControl')
 → registerAddGeojsonHereForMap(mapId, addDataset)
 → useMapDataset → scoped store key 'dataset'
User create / geojson-here / demo loader
 → addDataset → getMap → DatasetService.addDataset
 → traverseTree → addToMap (sources/layers)
LayerList watches datasetIds → list views by index
Drag reorder
 → syncListViewLayerOrder(map, views)
 → reindex + node.moveLayer (RTL)
Unmount
 → unregister control + add-geojson handler
removeMap
 → dataset store cleanup → clearDatasetsOnRemoveMap
```

### Data
- Input: `IDataset` trees / GeoJSON payloads  
- Mutation: dataset store arrays + MapLibre style layers  
- Title menus: `getLayerControlTitleMenuState(roots)` (**VERIFIED**)

---

## Feature: Identify

### Entry
`<IdentifyControl />` → `createIdentifySession`.

### Flow (VERIFIED)

```text
User opens identify / immediately
 → session.enableMapClickMode → EventClick active
User click
 → session.onMapClick → runQuery → runIdentifyMulti
 → identifyResolver → handleMultiIdentify
 → runMapControlAction(IDENTIFY_RESULT_CONTROL, update, items)
User box select
 → onBboxSelected → runQuery(box)  [ignored if mapClickActive]
Close
 → closeAndCleanup → clearIdentifyScope → teardown modes
 → host onCloseSideEffects → highlight.hideIfSource('identify')
```

### Data / highlight note
- **VERIFIED:** `runIdentifyMulti` does **not** paint highlight by itself.  
- Highlight `source: 'identify'` comes from **menus** / `handleMenuAction` / LayerMenuDefaultHandle.  
- Docs that said “adapters own runIdentifyMulti” were **outdated**; session owns query (**fixed in docs**).

### Async
Loading toggles session + cursor `wait`; empty hits may not open panel (resolver rules).

---

## Feature: Measurement

### Entry
`<MeasurementControl />` → `createMeasurementSession`.

### Flow (VERIFIED)

```text
Map READY onInit
 → session.attachToMap(map) → MapView layers + markers + form
User picks mode (distance/area/…)
 → startMode → Measure* action → EventClick on
User clicks
 → addMapClick → handler.add → form/setting fields update
Clear / toggle same mode
 → reset/clear → EventClick off
Unmount onDestroy
 → session.destroy
```

### Export
Geometry download via `buildMeasurementGeojsonDownload` (GeoJSON) — **not** KML/CSV in core (**VERIFIED**; hub docs corrected).

---

## Feature: Draw

### Entry
`useMapDraw(mapId).start(config)` + `<DrawControl />`.

### Flow (VERIFIED)

```text
start(config)
 → runDrawStart → mitt MAP_DRAW_EVENT.START
 → DrawControl onStart: map.addControl(MapDraw), draw.* listeners
useDrawEvents → createDrawSession (schedule + redrawNonDraft)
User draw/edit/delete
 → session handlers / handleMapClick
Save
 → prepareSave → save(getAll) → DrawService → cleanAfterDone? → redrawNonDraft
Cancel
 → finishCancel(onCancel?) → redrawNonDraft
removeMap / unmount
 → END event → close() removeControl; session.destroy
```

### Asymmetry
Hosts still construct `new MapDraw(...)` (not in session) — **VERIFIED** residual thick host.

---

## Feature: Theme

### Flow (VERIFIED)

```text
bootstrapMapTheme / ThemeControl.setMode
 → resolveMapTheme → applyMapThemeClass(document.documentElement)
 → persist localStorage
Optional: applyMapThemeForMap(mapId, resolved)
 → class on .map-container[data-map-id] only
```

---

## Feature: Draggable sidebar (map panel chrome)

### Flow (VERIFIED)

```text
Vue: createStoreRegistryPlugin() → $_hungpv_store
Adapter import → configureDragStore
DraggableContainer mount → useDragContainer.initContainer
 → notify ['drag:core','container', id]
LayerControl / DatasetControl mounts DraggableItemSideBar
 → registerItem / show → drag:core updates
UI drag via vue-draggable-resizable / react-rnd (position local + store z-order)
```

---

# 5. Data Flow (summary)

| Domain | Shape | Transform | Sink |
|--------|-------|-----------|------|
| Map instance | MapLibre `Map` | wrapped `MapSimple` | MapStoreManager |
| Datasets | `IDataset` tree | builders → parts | `'dataset'` store + map style |
| Identify | point/box → records | `runIdentifyMulti` / resolver | Result control payload |
| Measurement | clicks → coordinates | Turf Measure* | MapView layers + UI fields |
| Draw | FeatureCollection | DrawService deltas | app CRUD callbacks + drafts |
| Theme | mode string | resolve light/dark/named | html class + CSS vars |
| Logs | logger args | namespaces | ConsoleAdapter / devtools |

**Clone vs mutate:** style patches use immutable clone helpers (`applyStyleTabValue`); dataset/list order mutates view `index` + MapLibre moveLayer (**VERIFIED** for those paths).

---

# 6. State Flow

## Process-global (VERIFIED)

| Owner | Key / bag | Writers | Readers |
|-------|-----------|---------|---------|
| GlobalStoreService | `$_hungpv_store` | defineStore / getOrCreateStore | all packages |
| UniversalRegistry methods | platform GET_MAP / READY / cleanup | adapter store module load | `getMap`, `subscribeMapReady` |
| UniversalRegistry components | global component keys | `installMapApp` plugin | menus / DatasetMenus |
| Theme | `html` + localStorage | bootstrap / ThemeControl | CSS |
| LoggerFactory | `__hungpvq_LoggerFactory__` | first import | logHelper / demos |
| errorHandler | getOrCreateStore singleton | map-core | listeners |
| Tombstones | `map:core:meta` | removeMap | getMap guards |
| Drag store | `drag:core` | draggable core | vue/react shells |

## Per-mapId (VERIFIED)

| Owner | Key | Content |
|-------|-----|---------|
| MapStoreManager | root[mapId] | map instance + scoped stores |
| MAP_STORE_KEY | mitt, event, lang, crs, toolbar, image, print, … | feature stores |
| Adapters | `'dataset'`, `'draw'` | dataset list / draw config |
| UniversalRegistry | controls[mapId], menu handlers for map | control handles |

## SoT clarity / risks

- **VERIFIED:** Session SoT for measure/identify/draw in core; hosts mirror UI state.  
- **VERIFIED:** Duplicate Vue+React package copies share process bags via `globalThis` — intentional.  
- **Risk:** last-writer platform accessor; process-global theme.

---

# 7. Event Flow

| Event source | Name / channel | Listeners | Cleanup |
|--------------|----------------|-----------|---------|
| MapStoreManager | `MAP_CORE_EVENT.READY` | subscribeMapReady / useMap | unsub on unmount |
| Draw store mitt | `MAP_DRAW_EVENT.START/END` | useConfigDrawControl | store cleanup |
| MapLibre | `draw.*`, `click`, move/zoom | controls / sessions | off on destroy |
| useEventMap | EventClick / EventBbox | identify/draw/measure | remove on mode off / unmount |
| UniversalRegistry | control actions | IdentifyResultControl etc. | clearMap |
| shared createEventHook | various | demos / utils | per-hook |
| Theme | matchMedia / prefers-contrast | ThemeControl | remove on unmount |

---

# 8. Async Flow

| Trigger | Async | Loading | Cancel |
|---------|-------|---------|--------|
| Identify query | `runIdentifyMulti` await | session.loading + cursor | AbortSignal on session (`cancelQuery` / new click aborts prior; destroy aborts) |
| Draw save | await save / redraw | UI local | destroy no-ops session methods |
| Map READY | wait until initMap | subscribeMapReady | unsub |
| Dataset add | getMap callback when ready | — | tombstone no-op |
| Draw post-delete select | `schedule` (nextTick / microtask) | — | destroyed guard |

---

# 9. Error Flow

```text
MapError → errorHandler.handle
  → log via shared-log (dev/prod paths)
  → notify listeners
  → listener throw → logHelper (not console)  [VERIFIED]
```

Identify/Draw failures: largely promise rejection to host / empty results — **INFERRED** per-feature UI differs; no global Error Boundary required by library.

**UNKNOWN:** consumer app error UI outside demos.

---

# 10. Lifecycle

```text
App start
 → createStoreRegistryPlugin (Vue) / GlobalStoreService
 → installMapApp (theme + registry components)
 → import Map → registerMapAccessor (side effect)
 → Map mount → initMap → READY
 → Controls mount → registerControl + sessions + EventClick
 → Running …
 → Control unmount → unregister + session.destroy + listener off
 → Map unmount → removeMap → cleanups → clearMap → MapLibre remove
```

**VERIFIED good:** Identify/Draw/Measurement session destroy; StoreViewer intervals; Theme media cleanup; useMapImages subscribeMapReady unsub.

---

# 11. Public API (how to think about it)

Locked by `public-api.spec.ts` per package + `stable-api.md`.

| Consumer imports from | For |
|----------------------|-----|
| `@hungpvq/map-core` (+ subpaths) | getMap, registry, theme, measurement session, menu ids |
| `@hungpvq/map-dataset` (+ subpaths) | builders, identify session, style, menus |
| `@hungpvq/map-draw` | DrawService, MapDraw, createDrawSession, locales |
| `@hungpvq/vue-*` / `react-*` | UI components + hooks only |
| `@hungpvq/vue-draggable` / `react-draggable` | panel shells |
| `@hungpvq/shared-store` / `shared-log` | store plugin / logging |

Experimental symbols (e.g. `createDrawSession`) may change in a **minor**; removing them is **major**.

---

# 12. Dependency Graph (text)

```text
                    apps (demo-map / demo-draggable)
                              │
         ┌────────────────────┼────────────────────┐
         ↓                    ↓                    ↓
   vue/react-map-*     vue/react-draggable    demo-map-datasets
         │                    │
         ↓                    ↓
   map-dataset/draw      @hungpvq/draggable
         │
         ↓
      map-core ──→ shared-store, shared-log, shared
         │
         ↓
   maplibre-gl / mapbox-gl-draw / turf (peers)
```

No circular package deps in intended graph (**VERIFIED** from package.json direction).

---

# 13. Feature → File Map

| Feature | Entry | Main modules | Store | External |
|---------|-------|--------------|-------|----------|
| Bootstrap | `*/map-dataset/src/plugin/index.ts` | theme/, menu/registry-plugin | localStorage theme | DOM html |
| Map create | `*/map-core/.../Map.vue|tsx`, `useMapInstance` | store-manager, map-platform-registry | MapStoreManager | MapLibre |
| Layers | `LayerControl`, `LayerList` | DatasetService, order.ts, title-menus, add-geojson-here | `'dataset'` | MapLibre layers |
| Identify | `IdentifyControl` | identify-session, run-identify, resolver | session model + result control | MapLibre query |
| Measure | `MeasurementControl` | measurement-session, MapView | session UI state | MapLibre + Turf |
| Draw | `DrawControl`, `useMapDraw` | draw-session, DrawService | `'draw'` + mitt | Mapbox Draw |
| Theme | `ThemeControl` | theme/index.ts | localStorage | DOM |
| Highlight | menus / LayerMenuDefaultHandle | highlight controller | map-scoped | MapLibre |
| Draggable panel | `DraggableItemSideBar` | drag store, useInit* | `drag:core` | — |
| Errors | errorHandler | error-handler.service | getOrCreateStore | shared-log |
| Devtools | Devtools.vue/tsx | StoreViewer, LogViewer, ErrorViewer, DatasetMenuViewer | reads stores/logs; `window.__hungpvqDatasetDebug` | `@hungpvq/map-debug` |

---

# 14. Broken / Incomplete / Orphan flows

| Status | Finding |
|--------|---------|
| **INCOMPLETE (by design)** | Identify click → results; highlight needs menu path |
| **THICK HOST (reduced)** | DrawControl uses `createMapDrawControl` for construct/mount; hosts still own save/draft UI |
| **NO BACKEND** | No server implementation in workspace |

No verified “function called but missing implementation” in core session paths traced above.

---

# 15. Potential Problems

1. Theme default remains document-global; use `ThemeControl scope="map"` for per-map chrome.  
2. Adapter peer surface large (install DX).  
3. String store keys `'draw'` outside named constants (dataset uses `MAP_DATASET_STORE_KEY`).  
4. Draw hosts still own save/draft UI (construct/mount moved to `createMapDrawControl`).

---

# 16. Unknown / Not Verified

- Production consumer apps outside this monorepo.  
- Azure pipelines (none found).  
- Full MapLibre event surface of every small control (Home/Zoom/…) — same pattern as `useMap` + MapLibre API, not re-traced line-by-line here.  
- Runtime behavior of every demo dataset loader network URL.  
- Exact Nx CI target list beyond workflow file existence.

---

# 17. Final System Flow

```text
                    ┌──────────────────────┐
                    │  Consumer / Demo App │
                    └──────────┬───────────┘
                               ↓
              installMapApp + createStoreRegistryPlugin
                               ↓
         ┌─────────────────────┴─────────────────────┐
         ↓                                           ↓
  bootstrapMapTheme                          DatasetRegistryPlugin
  (html theme)                               (UniversalRegistry components)
         ↓                                           ↓
         └─────────────────────┬─────────────────────┘
                               ↓
                    Side-effect: registerMapAccessor
                               ↓
                         <Map mapId>
                               ↓
                    MapStoreManager.initMap
                               ↓
                         READY subscribers
                               ↓
        ┌──────────────┬───────┴────────┬──────────────┐
        ↓              ↓                ↓              ↓
   LayerControl   IdentifyControl  Measurement    DrawControl
   DatasetService createIdentify   createMeasure  createDraw
   syncListOrder  Session          Session        Session
        ↓              ↓                ↓              ↓
        └──────────────┴───────┬────────┴──────────────┘
                               ↓
                     MapLibre (+ Mapbox Draw)
                               ↓
                      UI update / panels
                    (DraggableItemSideBar)
```

### One-line answers

**When user does X?** → Follow Feature Flow section for X (bootstrap → session → MapLibre → UI).

**Where to edit X?** → Feature → File Map + keep orchestration in `map-core` / `map-dataset` / `map-draw`; adapters stay thin hosts.

---

*Generated from workspace reverse-engineering. Prefer re-running traces after large refactors; public surfaces locked by `public-api.spec.ts`.*
