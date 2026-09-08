# Stable API (v1)

Allowlist of symbols and protocols we treat as **Stable** for SemVer on `1.x`.

Root barrels use **explicit named exports** (same pattern as `@hungpvq/draggable` — no public `export *`). Aggregation for implementation lives in `src/internal-barrel.ts` (not a package entry). Runtime surface is locked by `public-api.spec.ts`. Symbols under **Experimental** may change in a **minor**.

**Runtime lock:** each package asserts `Object.keys(import * as api from './index')` equals Stable ∪ Experimental in `public-api.spec.ts` (type-only exports are erased at runtime and omitted from the lock). Root may export **first-party** types via explicit `export type { … }` — do **not** re-export types that already live in third-party packages (`geojson`, `maplibre-gl`, …); import those from the original package.

| Package | Spec |
|---------|------|
| `@hungpvq/map-core` | `libs/map-core/core/src/public-api.spec.ts` |
| `@hungpvq/map-dataset` | `libs/map-core/map-dataset/src/public-api.spec.ts` |
| `@hungpvq/vue-map-core` | `libs/vue/map-core/src/public-api.spec.ts` |
| `@hungpvq/vue-map-dataset` | `libs/vue/map-dataset/src/public-api.spec.ts` |
| `@hungpvq/react-map-core` | `libs/react/map-core/src/public-api.spec.ts` |
| `@hungpvq/react-map-dataset` | `libs/react/map-dataset/src/public-api.spec.ts` |

- Adding a **runtime** root export → add a **named** `export { X } from './internal-barrel'` (or from the feature module) in `src/index.ts`, update Stable **or** Experimental in `public-api.spec.ts`, and this page if Stable.
- Experimental symbols may change in a **minor**.
- Removing experimental symbols from the root barrel is a **major**.

Related: [SemVer checklist](../../../README.md#checklist-semver--breaking-change) · [Minimal starter](./minimal-starter.md) · [UniversalRegistry controls](./registry-controls.md) · [components](./registry-components.md)

## Registry architecture

- **Host:** `UniversalRegistry` in `@hungpvq/map-core` — methods, menu handlers, control handles (one resolve path: map-scoped then global).
- **Adapters:** `@hungpvq/vue-map-core` / `@hungpvq/react-map-core` **extend** that class and only add `registerComponent` / `getComponent`.
- Prefer `UniversalRegistry` / `runMapControlAction` from `@hungpvq/map-core` in framework-agnostic code (`map-dataset`, context menu).

## `@hungpvq/map-core`

| Area | Stable surface |
|------|----------------|
| Map access | `getMap`, `registerMapAccessor`, `MapStoreManager`, `MAP_STORE_KEY` |
| Theme | `bootstrapMapTheme`, `resolveMapTheme`, `applyMapThemeClass`, `MAP_THEME_*`, `MAP_THEME_STORAGE_KEY` |
| Registry | `UniversalRegistry` (method / menu-handler / control APIs), `runMapControlAction`, `MapControlHandle`, `REGISTRY_NAMESPACES`, `filterMapControls` |
| Init / errors | `MapInitializer`, `MapError` family, `errorHandler` |
| Locale bags | Documented `*_LOCALE` constants used by controls |
| Types (common) | Explicit `export type { … }`: `MapSimple`, `WithMapPropType`, `MapControlHandle`, `MapMenuItemProps`, `AddGeojsonHerePayload`, `MapStore`, … (first-party only) |

## `@hungpvq/map-dataset`

| Area | Stable surface |
|------|----------------|
| Service | `DatasetService` (`addDataset` / `removeDataset` / `getAllComponentsByType` — dependency order) |
| Builders | `createGeoJsonDataset`, `createRasterUrlDataset`, other documented `create*Dataset` / menu helpers (many still Experimental until promoted) |
| Protocol | `IDataset`, list/identify capability interfaces used by UI; `MenuContextSource`, `MenuItemProps`, … via explicit `export type` |
| Menu ids | `LIST_VIEW_MENU_ID`, `LIST_VIEW_MENU_COMPONENT_KEY` **string values** |
| Vite | `mapDatasetGisWorker()` / `@hungpvq/map-dataset/vite` |

## `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`

| Area | Stable surface |
|------|----------------|
| Shell | `Map` container, `@map-loaded` / `onMapLoaded` (and destroy equivalents) |
| Hooks | `useMap`, `useShow`, `useRegisterMapControl`, `useUniversalRegistry` |
| Registry | Framework `UniversalRegistry` (inherits core + `registerComponent*`), `RegistryItem` |
| Controls | Documented ModuleContainer controls and their **control ids** / action types (see [registry-controls](./registry-controls.md)): BaseMap*, Theme, Zoom, Home, Identify-related hosts live on dataset packages, etc. |
| Types | First-party: `WithShowProps` (from `useShow`); prefer `WithMapPropType` / `MapSimple` from `@hungpvq/map-core` |

## `@hungpvq/vue-map-dataset` / `@hungpvq/react-map-dataset`

| Area | Stable surface |
|------|----------------|
| Bootstrap | `createDatasetRegistryPlugin()` |
| UI | `LayerControl`, `IdentifyControl`, `IdentifyResultControl`, `IdentifyShowFirstControl`, `AttributeTable`, `StyleControl` |
| GIS re-exports | Stable symbols of `@hungpvq/map-dataset` (`DatasetService`, `createGeoJsonDataset`, `LIST_VIEW_MENU_*`, …) |

## CSS

Documented `--map-*` tokens and theme classes (`map-theme-*`) in [CSS variables](./css-variables.md). `style.css` package entries are stable import paths.

## Explicitly experimental

Still exported as **named** root exports (listed in each package’s `*_EXPERIMENTAL_RUNTIME_EXPORTS`). Treat as unstable (may change in a **minor**). Examples: deep visitors/utils, undocumented helpers, worker message shapes, draw internals, demo-only helpers, most menu builders until promoted to Stable.

## Enforcing the allowlist

1. Edit `src/index.ts` with **named** exports only (no public `export *`). Prefer `export { X } from './internal-barrel'` (or from a feature module). Export first-party types with explicit `export type { … }` — never `export type *`, and never re-export third-party library types.
2. Put new implementation symbols in feature modules / `internal-barrel`; only promote to root `index.ts` + allowlist when intentional.
3. Update the matching `public-api.spec.ts` allowlist arrays (runtime symbols only).
4. Update this page when changing Stable.
5. Do not hand-edit package `CHANGELOG.md` unless asked — use release tooling.
