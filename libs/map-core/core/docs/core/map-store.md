# Map store & `getMap`

Each **`mapId`** holds **one** MapLibre instance at a time (one shell / one live map). Reusing an id after `removeMap` is allowed via a new `initMap`; calling `initMap` while another live instance already owns that id throws `MapInitializationError`.

## Who exports what

| Concern | Package / entry |
|---------|-----------------|
| `getMap`, `subscribeMapReady`, `registerMapAccessor`, `registerMapReadySubscriber`, `registerMapStoreCleanup`, `MAP_PLATFORM_REGISTRY_METHOD`, `MapStoreManager`, `MAP_STORE_KEY`, `hasMapInstance` | `@hungpvq/map-core` |
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
| `__hungpvq_map_errorHandler__` (`errorHandler`) | `getOrCreateStore` | Centralized map error handler singleton |
| `__hungpvq_gis_worker__` | `getOrCreateStore` | GIS Web Worker URL override (`configureGisWorker`) |
| `map:registry:global` | `getOrCreateStore` | UniversalRegistry global methods / components / menu handlers |
| `map:registry:maps` | `getOrCreateStore` | Per-`mapId` registry bags |
| `map:registry:controls` | `getOrCreateStore` | Control handle registry |
| `hungpvq.map-theme-mode` | `localStorage` (`MAP_THEME_STORAGE_KEY`) | Persisted theme mode (not a shared-store bag) |
| `map:core` | `defineStore` / root bag | Per-`mapId` map store entries (instance, scoped features, cleanups) |
| `map:core:meta` | `getOrCreateStore` | `removedMapIds` tombstones after `removeMap` |

Related process pins outside this table: `__hungpvq_map_errorCapture__`, React `__hungpvq_react_map_storeManager__`, and `LoggerFactory` on `@hungpvq/shared-log`’s own `globalThis` key.

## Lifecycle (engine)

`MapStoreManager` (used by adapters):

- `initMap(mapId, map)` — set the single instance and emit `MAP_CORE_EVENT.READY` (fails if a different live map already owns `mapId`); clears the process-wide tombstone for that id
- `removeMap(mapId)` — run registered cleanups, clear registry scope, delete the store entry, and tombstone the id so `getMap(id, cb)` / `subscribeMapReady` do **not** wait for READY or recreate an entry
- `getMap(mapId, cb?)` — `MapSimple | undefined`; with `cb`, waits for READY only when the id is not tombstoned (internally shares wait logic with `subscribeMapReady`)
- `subscribeMapReady(mapId, cb)` — `() => void` unsubscribe; sync when live, waits when pending, no-op when tombstoned
- `registerCleanup` / public `registerMapStoreCleanup(mapId, key, fn)` — map-scoped teardown on `removeMap`

**Tombstones** live in a process-wide `@hungpvq/shared-store` bag (`map:core:meta.removedMapIds`), so separate Vue and React `MapStoreManager` instances (or duplicate package copies) share the same removed-id set.

See also [Stable API](./stable-api.md) · [Error handling](./error-handling.md) · [Minimal starter](./minimal-starter.md).
