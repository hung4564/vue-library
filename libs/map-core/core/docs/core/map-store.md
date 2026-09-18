# Map store & `getMap`

Each **`mapId`** holds **one** MapLibre instance at a time (one shell / one live map). Reusing an id after `removeMap` is allowed via a new `initMap`; calling `initMap` while another live instance already owns that id throws `MapInitializationError`.

## Who exports what

| Concern | Package / entry |
|---------|-----------------|
| `getMap`, `subscribeMapReady`, `registerMapAccessor`, `registerMapReadySubscriber`, `registerMapStoreCleanup`, `MAP_PLATFORM_HOST`, `listMapPlatformHosts`, `MAP_PLATFORM_REGISTRY_METHOD`, `MapStoreManager`, `MAP_STORE_KEY`, `hasMapInstance` | `@hungpvq/map-core` |
| Domain features (basemap, crs, event, image, legend, measurement, menu, print, theme, toolbar) | `@hungpvq/map-core/<domain>` |
| In-worker helpers | `@hungpvq/map-core/worker` |
| `createMapScopedStore`, `destroyMapScopedStore`, `getStore`, `addStore`, `useMapContainer` | `@hungpvq/vue-map-core` / `@hungpvq/react-map-core` |

Adapters **do not** re-export `getMap` or domain protocol. Apps import platform APIs from `@hungpvq/map-core` and feature APIs from the matching subpath (see [Stable API](./stable-api.md)).

## Access the map

```ts
import { getMap, subscribeMapReady } from '@hungpvq/map-core';
import type { MapSimple } from '@hungpvq/map-core';

const map = getMap('map-1'); // MapSimple | undefined

getMap('map-1', (map: MapSimple) => {
  // Runs now if ready, or when MapStoreManager emits READY
});

// Prefer when you need to cancel the wait (unmount / destroy):
const unsubscribe = subscribeMapReady('map-1', (map) => {
  // …
});
unsubscribe();
```

The Vue / React `Map` shell registers the accessor via `registerMapAccessor` / `registerMapReadySubscriber` and calls `initMap` / `removeMap` through `useMapContainer`.

Platform accessors are stored as **UniversalRegistry global methods** under reserved keys (`MAP_PLATFORM_REGISTRY_METHOD.*`, e.g. `__platform.getMap`). They live in the shared `map:registry:global` bag — `clearMap` / `removeMap` does **not** remove them — so duplicate package copies still share one wiring.

**`registerMapAccessor` / `registerMapReadySubscriber` / `registerMapStoreCleanupRegistrar`:** accept optional `{ hostId }` (e.g. `MAP_PLATFORM_HOST.VUE_MAP_CORE` / `REACT_MAP_CORE`). Same `hostId` replaces that host only (version bump); different hosts **coexist** — composite `getMap` / READY fan out until a map is found. Returns `{ hostId, version, unregister }`. Prefer one framework host per app; multi-host pages no longer silently last-writer-wins.

## Scoped stores

Use documented `MAP_STORE_KEY` values for feature state keyed by `mapId`:

| Key | Value | Typical use |
|-----|-------|-------------|
| `MITT` | `mitt` | Event bus |
| `EVENT` | `event` | Map event management |
| `IMAGE` | `image` | Map images |
| `TOOLBAR` | `toolbar` | Toolbar modules |
| `LANG` | `lang` | Locale catalogs + active language (`registerLocale` / `setLanguage`) |
| `CRS` | `crs` | CRS store |
| `PRINT` | `print` | Print options |
| `REGISTRY` | `registry` | Control registry scope |
| `BASEMAP` | `basemap` | Basemap selection |
| `RESOLVER` | `resolver` | Per-map FallbackResolver overrides (`identify-resolver`, `highlight-resolver`, …); process defaults live on `map:core:meta.registries` |

Adapter domains may also use **string** scoped keys outside `MAP_STORE_KEY`:

| Key | Owner | Constant |
|-----|-------|----------|
| `'dataset'` | vue/react `map-dataset` store bag | `MAP_DATASET_STORE_KEY` from `@hungpvq/map-dataset` |
| `'draw'` | vue/react `map-draw` session config | (adapter-local; prefer a named constant when touching) |

Prefer `MAP_STORE_KEY` when adding new **core-owned** stores; domain keys live in the owning package. Changing a documented store key **string value** is a SemVer **major**.

```ts
import { MAP_STORE_KEY } from '@hungpvq/map-core';
import { createMapScopedStore, getStore } from '@hungpvq/vue-map-core';
// or from '@hungpvq/react-map-core'

createMapScopedStore(mapId, MAP_STORE_KEY.CRS, () => ({ /* … */ }));
const crs = getStore(mapId, MAP_STORE_KEY.CRS);
```

**Cleanup callbacks** passed to `createMapScopedStore(..., { cleanup })` must resolve the store with `getStore(mapId, key)` (or an already-captured reference). Do **not** call the same `useMap*Store(mapId)` factory from inside `cleanup` — that creates a circular TypeScript inference (`TS7023`) and can re-enter `addStore` during teardown.

Domain packages (dataset, draw, event, highlight, …) should also register teardown with `registerMapStoreCleanup(mapId, key, fn)` when their resources are not owned by a scoped-store `cleanup` option.

Changing a `MAP_STORE_KEY.*` **string value** is a SemVer **major**.

## Process-wide singletons

These keys live on `@hungpvq/shared-store` (`globalThis.$_hungpv_store`) unless noted. Duplicate package copies and Vue/React adapters must share them — do **not** invent parallel bags or class-static `Map`s.

| Key / export | Kind | Purpose |
|--------------|------|---------|
| `__hungpvq_gis_worker__` | `getOrCreateStore` | GIS Web Worker URL override (`configureGisWorker`) |
| `map:registry:global` | `getOrCreateStore` | UniversalRegistry global methods / components / menu handlers |
| `map:registry:maps` | `getOrCreateStore` | Per-`mapId` registry bags |
| `map:registry:controls` | `getOrCreateStore` | Control handle registry |
| `hungpvq.map-theme-mode` (+ optional `:<mapId>`) | `localStorage` (`MAP_THEME_STORAGE_KEY` / `getMapThemeStorageKey(mapId)`) | Theme preference. Default **process-global**; `ThemeControl scope="map"` uses per-map key. |
| `map:core` | `defineStore` / root bag | Per-`mapId` map store entries (instance, scoped features, cleanups); per-map resolver overrides at `[mapId].resolver` |
| `map:core:meta` | `getOrCreateStore` | `removedMapIds` tombstones; `errorCapture` install slot; `errorHandler` singleton; `registries` process defaults (`createMapCoreMetaRegistry`) |
| `map:debug` | `getOrCreateStore` | Optional `@hungpvq/map-debug`: `dataset` = Dataset Inspector API (`installDatasetDebug`). Console alias: `window.__hungpvqDatasetDebug` |

Related process pins outside this table: `LoggerFactory` on `@hungpvq/shared-log`’s own `globalThis` key.

## Empty / deferred `mapId`

- **Never** create scoped stores under `mapId === ''` — `MapStoreManager` rejects empty ids and scrubs legacy `map:core[""]`.
- Use Stable `isUsableMapId(mapId)` before `createMapScopedStore` / dataset mutations.
- **`useMapDataset`:** apps may call the hook before the map exists, then `setMapId(map.id)` on `@mapLoaded` / `onMapLoaded`.
  - Vue: does not allocate a dataset bag until `mapId` is usable.
  - React: uses an inert in-memory stand-in until `setMapId` (never writes `map:core[""]`).

## Shell `initOptions` defaults

`MapInitializer.createDefaultOptions` is the single source for shell defaults (`attributionControl: false`, center/zoom, …). Vue/React `Map` should pass app overrides only — do not fork defaults in the adapters. MapLibre has no `zoomControl` option; use `ZoomControl` / `NavigationControl` for zoom chrome.

## Multi-map DOM notes

| Surface | Scope |
|---------|--------|
| Theme (`applyMapTheme` → `html` and/or map shell) | `document` (default) = process-global; `map` = per-`mapId` |
| Layer search (`/` shortcut) | Per `mapId` via `[data-map-layer-search][data-map-id]` |
| Devtools drag host | `containerId` and/or `mapId` — no first-match in document |

### Multi-map caveats (apps with Map A + Map B)

- **Per-map state is safe** when keyed by `mapId` (`MapStoreManager`, scoped stores, registry maps bag).
- **Theme:** default `ThemeControl` / `bootstrapMapTheme` use `scope: 'document'` (one `html` chrome theme). For independent themes use `<ThemeControl scope="map" />` or `applyMapTheme(resolved, { scope: 'map', mapId })` / `bootstrapMapTheme(mode, { scope: 'map', mapId })`.
- Platform accessors are **multi-host** (`hostId`); Vue/React register separately and composite `getMap` resolves across hosts.
- Prefer `subscribeMapReady(mapId, cb)` over fire-and-forget `getMap(id, cb)` so each shell can unsubscribe on unmount without racing another map’s READY.
- **Consumer rule:** call `bootstrapMapTheme` once for document chrome (or omit and let ThemeControl apply); use `scope="map"` when maps must differ.

## Lifecycle (engine)

`MapStoreManager` (used by adapters):

- `initMap(mapId, map)` — set the single instance and emit `MAP_CORE_EVENT.READY` (fails if a different live map already owns `mapId`); clears the process-wide tombstone for that id
- `removeMap(mapId)` — run registered cleanups, clear registry scope, delete the store entry, and tombstone the id so `getMap(id, cb)` / `subscribeMapReady` do **not** wait for READY or recreate an entry
- `getMap(mapId, cb?)` — `MapSimple | undefined`; with `cb`, waits for READY only when the id is not tombstoned (internally shares wait logic with `subscribeMapReady`)
- `subscribeMapReady(mapId, cb)` — `() => void` unsubscribe; sync when live, waits when pending, no-op when tombstoned
- `registerCleanup` / public `registerMapStoreCleanup(mapId, key, fn)` — map-scoped teardown on `removeMap`

**Tombstones** live in a process-wide `@hungpvq/shared-store` bag (`map:core:meta.removedMapIds`), so separate Vue and React `MapStoreManager` instances (or duplicate package copies) share the same removed-id set.

See also [Stable API](./stable-api.md) · [Error handling](./error-handling.md) · [Minimal starter](./minimal-starter.md).
