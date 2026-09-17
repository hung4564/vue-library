---
name: map-dual-framework
description: >-
  Guides Vue and React map adapter parity on top of framework-agnostic
  @hungpvq/map-core and map-dataset. Use when adding or changing map controls,
  hooks, registry plugins, dataset UI, or when mirroring a feature across Vue
  and React.
---

# Map Dual Framework (Vue + React)

## Layering

```
libs/map-core/core          → engine, store, theme, UniversalRegistry (host)
libs/map-core/map-dataset   → datasets, menus, identify, style protocol, GIS worker
libs/map-core/map-draw      → DrawService, DrawingType, styles, inspect helpers
libs/vue|react/map-core     → Map shell, controls, hooks; extend registry with components
libs/vue|react/map-dataset  → dataset UI + createDatasetRegistryPlugin() only
libs/vue|react/map-draw     → DrawControl / InspectControl (shared InspectController)
```

**Import rule:** adapters must **not** re-export core. Apps import builders/types/services from `@hungpvq/map-core` / `@hungpvq/map-dataset` / `@hungpvq/map-draw`, and UI/hooks from `@hungpvq/vue-*` or `@hungpvq/react-*`.

Never reintroduce adapter `builder/` / `model/` / `services/` barrels that only re-export `@hungpvq/map-dataset` (or core). Domain protocol stays on `@hungpvq/map-dataset/<domain>`; adapter `extra/` is framework menu-action UI only.

- Prefer importing `UniversalRegistry` / `runMapControlAction` / `buildMapControlHandle` from `@hungpvq/map-core` in framework-agnostic code.

## Parity workflow

When adding a dual feature:

1. Implement protocol / logic in `map-core` or `map-dataset` if framework-agnostic (**pure / controller first** — see Thin-host controls).
2. Add Vue control/hook/UI under `libs/vue/...` as a **thin host**.
3. Mirror React under `libs/react/...` with the same control **ids**, action **types**, and public hook names where Stable.
4. Register via existing patterns (`useRegisterMapControl`, dataset registry plugin).
5. Update docs for both demos if user-facing.
6. Check SemVer (`map-semver-api`) — new control id is usually **minor**; rename is **major**.

Skip React only when the area is explicitly Vue-richer (e.g. full Inspect popup) or the user scopes to one framework.

## Thin-host controls

New dual control = **pure orchestration in core/domain first**, then thin Vue + React hosts.

```text
core / map-dataset / map-draw:
  captureX / applyX / createXModel / createXSession  (framework-agnostic)
vue / react:
  XControl  → useMap + useRegisterMapControl + useToolbarControl + template/JSX
```

Rules:

- Do **not** fold `vue-map-core` ↔ `react-map-core` into one package.
- Do **not** put SFC/JSX, provide/inject, or React Context into `@hungpvq/map-core`.
- Prefer `subscribeMapReady(mapId, cb)` over fire-and-forget `getMap(id, cb)` when the host can unmount before READY.
- Parity lock: `MAP_DUAL_CONTROL_IDS` in `libs/map-core/core/src/dual/parity-catalog.ts` + adapter `vue-react-parity.spec.ts`.
- MapLibre `MapSimple` stays a public Stable type — do not abstract/hide the engine behind a custom map facade.

**Checklist when adding a dual control/tool:**

1. Put orchestration in `create*Session` / helpers under `map-core` / `map-dataset` / `map-draw` **first**.
2. Vue + React hosts only bind UI (`useRegisterMapControl`, toolbar, EventClick, slots) — no duplicated GIS sequence.
3. Update `MAP_DUAL_CONTROL_IDS` / adapter `vue-react-parity.spec.ts` when the control id is new.
4. Add or extend **behavioral** session tests (not only export/id catalog); update the dual checklist comment in `libs/map-core/core/src/dual/behavioral-parity.spec.ts`.
5. Lock new public exports in the package `public-api.spec.ts` (+ Stable/Experimental docs as needed).

Existing pure owners to copy: `GeoLocateSession`, `createCopyFeedback`, theme/fullscreen helpers, `createIdentifyControlModel`, `createIdentifySession`, `createMeasurementSession`, `createDrawSession`, `createMeasurementMapView` / `createMeasurementMapViewLayers`, `createPrintAdvancedSession`, `createLiveToolbarStrategy`, `normalizeDisplayEpsgs`, `InspectController`, `draw-control-helpers`, root `controls/*` (home, globe, navigation, goto, setting, mouse-coordinates, info).

## Draw checklist

- Docs SoT: `libs/map-core/map-draw/docs` → `/map/draw/` (protocol + DrawControl; **Inspect documented under draw**, not a separate page).
- Control ids (must match Vue ↔ React): `mapDrawDraftList`, `mapInspectControl`.
- Stable shell: `DrawControl`, `InspectControl`, `useMapDraw`, `useConfigDrawControl`, `useMapDrawStore` (protocol / `isDraftOption` / locales from `@hungpvq/map-draw` — adapters do **not** re-export them).
- React Inspect uses the same `InspectController` as Vue (style + popup).
- Demo route: Vue/React `/#/draw` only (no separate inspect demo page).
- Peers: `@hungpvq/map-draw`, `@mapbox/mapbox-gl-draw`, `maplibre-gl`.

## Registry conventions

- **Host:** `UniversalRegistry` in map-core — methods, menu handlers, **components**, control handles. Bags on `@hungpvq/shared-store` (`map:registry:global` / `maps` / `controls`); never class-static `new Map`.
- **Platform fn wiring:** `registerMapAccessor` / Ready / Cleanup = UniversalRegistry **global** methods under `MAP_PLATFORM_REGISTRY_METHOD.*` (`__platform.*`). `clearMap` does not remove them.
- **Process instances:** `errorHandler`, GIS worker URL, React `storeManager` → `getOrCreateStore` on `@hungpvq/shared-store` (`globalThis.$_hungpv_store`). `LoggerFactory` pins on its own `globalThis` key inside `@hungpvq/shared-log`. Never RegistryFn for these. Full key table (registry global, theme storage, `map:core`, `map:core:meta` tombstones): `libs/map-core/core/docs/core/map-store.md` § Process-wide singletons.
- **App state:** `defineStore` / `getOrCreateStore` / `map:core` / domain scoped stores on `$_hungpv_store` only — do **not** use `@hungpvq/shared` for stores.
- **Adapters:** vue/react `map-core` extend the class and only add typed `registerComponent` / `getComponent` (Vue: `markRaw`). Do **not** create a parallel store outside shared-store.
- Dataset UI must keep `createDatasetRegistryPlugin()` (or equivalent) so menus/components resolve.
- Do not rename documented control ids or menu component keys without a major bump.
- **Component overrides (dataset UI, attribute-table parts, menu action UI, …):** prefer `UniversalRegistry.registerComponent` / `registerComponentForMap` + stable keys (`ATTRIBUTE_TABLE_COMPONENT_KEY`, `LIST_VIEW_MENU_COMPONENT_KEY`, …) and `RegistryItem`. Props are for data / toggles (`ui`, `columns`, `store`, …). Do **not** add a parallel “pass components via props” API unless the feature has no registry key yet.

## Buttons: always `MapControlButton` (+ `MapCopyButton` for copy)

In **all** map library UI (`libs/vue/map-*`, `libs/react/map-*`, including dataset, draw, devtools, controls, toolbars, pagers, menus chrome):

- **Always** use Stable root `MapControlButton` from `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`.
- Do **not** use raw `<button>`, `BaseButton`, ad-hoc button classes, or Experimental `./fields` button primitives for map chrome actions.
- Prefer `variant` (`icon` \| `plain` \| `text` \| `tonal` \| `outlined` \| `filled`) + `size` (`small` \| `medium` \| `large` \| px). Dense rows (attribute table, layer list): usually `size="small"`.
- Variant/size SoT lives in `@hungpvq/map-core` `ui/map-button` (locked via dual parity tests).
- **Text copy chrome:** always use Stable root `MapCopyButton` (wraps `MapControlButton` + core `createCopyFeedback`). Success feedback = icon `mdiContentCopy` → `mdiCheck` + title “Copied” for ~1.5s — **no toast**. Do not reimplement with ad-hoc `createCopyFeedback` + check icon in Vue/React map UI. Low-level `copyText` / `createCopyFeedback` stay on `@hungpvq/map-core` for menus / non-button copy. Docs: `css-variables.md` § MapCopyButton, `stable-api.md`.

### Action-button feedback (Pin, Refresh, Run, save, …)

Các nút có hành động thì phải đủ các trạng thái → loading → thành công sau vài giây thì quay về trạng thái bt.

- **Phases:** `idle` → `loading` → `success` | `error` → `idle` after ~`ACTION_FEEDBACK_MS` (1.5s). **No toast.**
- **SoT:** `createActionFeedback` from `@hungpvq/map-core` (+ `MapControlButton`). Wire label/icon/title/`disabled` from `phase` + `key`.
- **Copy** stays on `MapCopyButton` / `createCopyFeedback` (idle → success only).
- Sync work may use `succeed(key)` (skip loading) when there is nothing to await; async work must use `run(key, work)` so loading is visible.
- Show success in the control itself (label “Pinned” / check icon / title) — same pattern as copy — not a separate banner.

App/demos that mirror library UI should follow the same rule when building map chrome.

## Draggable header titles

When a map control mounts `DraggableItemSideBar` / popup / float:

- **Sidebar:** always pass plain `title` (string) for the switcher store label. Use Vue `#title` / React `titleNode` only when the visible header differs from that string (styled node, dynamic chrome). Examples: LayerControl, StyleControl.
- **Popup / float:** `title` is string-only on both adapters; put menus/actions in `after-title` / `afterTitle` (`location: 'title'` maps there). Document the mapping in each package’s own docs — **never** cross-link dataset ↔ draggable docs (`map-docs-vitepress` Doc isolation).
- **Do not** pass a ReactNode as React sidebar `title` — that blanks the switcher menu (store coerces non-strings to `''`).
- CreateControl / DatasetControl / WorkerControl with plain text need only `title={trans(...)}` (no `titleNode`).

## Adapter wrappers (avoid)

- **CreateControl SoT:** core `LayerHelper` from `@hungpvq/map-dataset/create-control` + framework leaf config forms. **No** adapter `helper/` thin wrapper; **no** `config/index` barrel — import leaf files.
- **Legend / style label:** register or import from leaf paths (`./parts/*`, `./MultiLegend`, `./div-color.vue`); avoid `modules/Legend/index.*` re-export hops.
- Domain protocol stays on `@hungpvq/map-dataset/<domain>`; adapter `extra/` is framework menu-action UI only.

## Naming / structure cues

- Vue: SFC under `modules/`, Composition API hooks
- React: TSX under matching module folders; hooks like `useMap`, `useMapInstance`, `useRegisterMapControl`
- Shared styles: package `style.css` entries and documented CSS variables — change carefully
- Dataset menu UI parity: **`DatasetMenus`** (+ `DatasetMenuButton`) in both adapters; same props (`menus`, `locations`, `data`, `value?`, `mapId`)
- **Locales:** fixed languages in `locale/locale.<lang>.ts` (+ `<domain>/locale/locale.<lang>.ts`) — see `map-locale` skill

## React Vite demos

Path aliases resolve `@hungpvq/react-*` into `libs/`. Exclude `libs/` from Fast Refresh or named exports break in the browser:

```ts
react({ exclude: [/node_modules/, /[\\/]libs[\\/]/] });
```

Same rule as draggable demos (`draggable-semver-api`, `vue-library-overview`).

## Map `buttonInMobile` (≤640px)

`Map` prop `buttonInMobile`: `'button' | 'toolbar' | 'menu'` (default `'button'`). Resolved via `resolveControlLayout` → `ResolvedControlLayout` (`standalone` | `toolbar` | `menu`).

| Value | Behavior |
|-------|----------|
| `button` | Corner `#btn` unchanged |
| `toolbar` | Promote controls into one `ToolbarControl` host (except `controlLayout="button"`) |
| `menu` | Hide per-control corner `#btn`; fan out clusters by `position` into corner stacks; outside-in More. Overflow/budget helpers live in `@hungpvq/map-core/toolbar`. |


Rules:

- Do **not** put overflow/More logic inside `MapControlGroupButton` for `menu` — overflow is per-corner in `ToolbarControl`.
- `controlLayout="button"` never auto-promotes (stays standalone). Use it for status chrome (e.g. `MouseCoordinatesControl`).
- Mount a single `<ToolbarControl />` for both `toolbar` and `menu`. Menu uses `ModuleContainer` `#btn` + `#btnOutside`.
- Demo: `/#/mobile-menu`; opt-in toolbar: `/#/toolbar`.
- Mirror Vue + React; shared helpers in `@hungpvq/map-core` / `@hungpvq/map-core/toolbar`.

## Checklist before finishing

- [ ] Core logic not duplicated only in one framework package
- [ ] Control ids / actions match across Vue and React (if dual)
- [ ] Dataset plugin / registry wiring still registers components
- [ ] Types exported consistently from package entry
- [ ] Demo or docs smoke path noted if UI-visible
- [ ] New React Vite apps that alias `libs/` exclude Fast Refresh on `libs/`
- [ ] Experimental field names on `./fields`: prefer `BaseCollapse` / `InputTextArea` (aliases `Collapse` / `InputTextarea`)
- [ ] Every new/changed map UI button uses `MapControlButton` (never raw `<button>` / removed `BaseButton`); text-copy actions use `MapCopyButton`
- [ ] Action buttons (Pin / Run / save / async) use `createActionFeedback` phases: idle → loading → success|error → idle (~1.5s); copy uses `MapCopyButton`
- [ ] Run `nx test @hungpvq/map-core -- vue-react-parity.spec.ts` when adding dual controls or shared exports

**Automated lock:** `libs/map-core/core/src/dual/parity-catalog.ts` + `vue-react-parity.spec.ts` (control ids + shared Stable root + shared `/fields` Experimental allowlists + `MapControlButton` `variant`/`size` SoT in `@hungpvq/map-core` `ui/map-button`).
