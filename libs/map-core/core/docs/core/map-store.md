# Map store & `getMap`

Each **`mapId`** holds **one** MapLibre instance.

## Who exports what

| Concern | Package / entry |
|---------|-----------------|
| `getMap`, `registerMapAccessor`, `MapStoreManager`, `MAP_STORE_KEY`, `hasMapInstance` | `@hungpvq/map-core` |
| Domain features (basemap, crs, event, image, legend, measurement, menu, print, theme, toolbar) | `@hungpvq/map-core/<domain>` |
| In-worker helpers | `@hungpvq/map-core/worker` |
| `createMapScopedStore`, `destroyMapScopedStore`, `getStore`, `addStore`, `useMapContainer` | `@hungpvq/vue-map-core` / `@hungpvq/react-map-core` |

Adapters **do not** re-export `getMap` or domain protocol. Apps import platform APIs from `@hungpvq/map-core` and feature APIs from the matching subpath (see [Stable API](./stable-api.md)).

## Access the map

```ts
import { getMap } from '@hungpvq/map-core';
import type { MapSimple } from '@hungpvq/map-core';

const map = getMap('map-1'); // MapSimple | undefined

getMap('map-1', (map: MapSimple) => {
  // Runs now if ready, or when MapStoreManager emits READY
});
```

The Vue / React `Map` shell registers the accessor via `registerMapAccessor` and calls `initMap` / `removeMap` through `useMapContainer`.

## Scoped stores

Use documented `MAP_STORE_KEY` values for feature state keyed by `mapId`:

| Key | Value | Typical use |
|-----|-------|-------------|
| `MITT` | `mitt` | Event bus |
| `EVENT` | `event` | Map event management |
| `IMAGE` | `image` | Map images |
| `TOOLBAR` | `toolbar` | Toolbar modules |
| `LANG` | `lang` | Locale |
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

Changing a `MAP_STORE_KEY.*` **string value** is a SemVer **major**.

## Lifecycle (engine)

`MapStoreManager` (used by adapters):

- `initMap(mapId, map)` — set the single instance and emit `MAP_CORE_EVENT.READY`
- `removeMap(mapId)` — cleanup + clear registry scope for that id
- `getMap(mapId, cb?)` — `MapSimple | undefined`

See also [Stable API](./stable-api.md) · [Error handling](./error-handling.md) · [Minimal starter](./minimal-starter.md).
