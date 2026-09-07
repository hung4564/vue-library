# Stable API (v1)

Allowlist of symbols and protocols we treat as **Stable** for SemVer on `1.x`.

Everything else reached via root `export *` is **experimental**: may change in a **minor** if the team follows this page. Until then, treat undocumented barrel exports as public-at-risk.

Related: [SemVer checklist](../../../README.md#checklist-semver--breaking-change) · [UniversalRegistry controls](./registry-controls.md) · [components](./registry-components.md)

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

## `@hungpvq/map-dataset`

| Area | Stable surface |
|------|----------------|
| Service | `DatasetService` (`addDataset` / `removeDataset` / `getAllComponentsByType` — dependency order) |
| Builders | `createGeoJsonDataset`, primary `create*Dataset` / menu builders documented under Create dataset |
| Protocol | `IDataset`, list/identify capability interfaces used by UI |
| Menu ids | `LIST_VIEW_MENU_ID`, `LIST_VIEW_MENU_COMPONENT_KEY` **string values** |
| Vite | `mapDatasetGisWorker()` / `@hungpvq/map-dataset/vite` |

## `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`

| Area | Stable surface |
|------|----------------|
| Shell | `Map` container, `@map-loaded` / `onMapLoaded` (and destroy equivalents) |
| Hooks | `useMap`, `useShow`, `useRegisterMapControl` |
| Registry | Framework `UniversalRegistry` (inherits core + `registerComponent*`), `useUniversalRegistry` (`getComponent`), `RegistryItem` |
| Controls | Documented ModuleContainer controls and their **control ids** / action types (see [registry-controls](./registry-controls.md)) |

## `@hungpvq/vue-map-dataset` / `@hungpvq/react-map-dataset`

| Area | Stable surface |
|------|----------------|
| Bootstrap | `createDatasetRegistryPlugin()` |
| UI | `LayerControl`, Identify / Attribute table / Style controls documented in dataset docs |
| Re-exports | Stable symbols of `@hungpvq/map-dataset` when imported via the framework package |

## CSS

Documented `--map-*` tokens and theme classes (`map-theme-*`) in [CSS variables](./css-variables.md). `style.css` package entries are stable import paths.

## Explicitly experimental (examples)

Internal visitors/utils not listed above, unnamed helper exports, worker message shapes not documented, draw internals, demo-only helpers.
