---
name: map-domain-store
description: >-
  Registers and accesses per-mapId protocol state on map:core via
  registerMapDomainStoreFactory, ensureMapDomainStore, peekMapDomainStore, and
  deleteMapDomainStore. Use when adding a new map store, MAP_STORE_KEY, scoped
  bag, registry per-map state, or migrating off process-wide getOrCreateStore
  maps[mapId] patterns.
---

# Map domain stores (`map:core[mapId]`)

## Rule (default)

**Any new per-`mapId` protocol / feature state** goes on `map:core[mapId][key]` using:

| Helper                                                     | Role                        |
| ---------------------------------------------------------- | --------------------------- |
| `registerMapDomainStoreFactory(key, { create, cleanup? })` | Process-wide factory (once) |
| `ensureMapDomainStore(mapId, key)`                         | Get or create bag           |
| `peekMapDomainStore(mapId, key)`                           | Read without allocating     |
| `deleteMapDomainStore(mapId, key)`                         | Drop bag (e.g. clearMap)    |

Do **not**:

- Invent `getOrCreateStore('map:something').maps[mapId]` for per-map data
- Use Vue/React `createMapScopedStore` / `addStore` for keys that already (or should) have a domain factory
- Put framework `ref` / React state on the bag — plain objects only (see dataset store)

**Still process-wide** (OK with `getOrCreateStore`): true singletons such as `map:registry:global`, `map:core:meta`, GIS worker URL, theme `localStorage`.

## Steps when adding a store

1. Add key to `MAP_STORE_KEY` (`libs/map-core/core/src/types/constants.ts`) **or** a package constant (`MAP_DATASET_STORE_KEY`, `MAP_DRAW_STORE_KEY`, …). Changing the string value is SemVer **major**.
2. Add `register-domain-store.ts` (or lazy `ensure*Factory` if import cycle with `UniversalRegistry` / `map-platform-registry` — see `controls-store.ts`).
3. Export `ensureMap*Store(mapId)` (+ peek/clear helpers as needed).
4. Import the factory module from the package entry (or rely on lazy ensure).
5. Update [map-store.md](../../libs/map-core/core/docs/core/map-store.md) key table + “Declare a new per-map domain store”; Stable surface → `stable-api.md` + `public-api.spec.ts`.
6. Optional adapter hook `useMap*Store` → calls `ensure*` only.

Full checklist and example: `libs/map-core/core/docs/core/map-store.md` § **Declare a new per-map domain store**.

## Existing keys (orientation)

- map-core: `mitt`, `event`, `image`, `toolbar`, `lang`, `crs`, `print`, `basemap`, `resolver`, `controls`, `control-layout`, `control-auto-button`, `registry-maps`
- map-dataset: `dataset`
- map-draw: `draw`

References: `basemap/register-domain-store.ts`, `registry/controls-store.ts`, `registry/registry-maps-store.ts`, `map-dataset/src/register-domain-store.ts`.

## SemVer

- New key + `ensure*` export → usually **minor**
- Rename/remove key string or move off `map:core` → **major**
- Follow `map-semver-api` skill for allowlists / coordinated release
