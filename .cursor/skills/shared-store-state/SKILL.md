---
name: shared-store-state
description: >-
  Process and feature state goes on @hungpvq/shared-store (getOrCreateStore /
  defineStore) or an existing ensure* bag — not module-level let/const Maps.
  Use when adding local state, caches, registries, flags, listeners, ensure*
  helpers, getOrCreateStore, or migrating off module singletons.
---

# Shared-store for local state

Mutable process / feature state is a **store bag**, not a file-private `let`. Prefer an **existing** `ensure*` / `get*Store` and add the field there.

Do **not** apply a repo-wide rewrite unless the user asks. When you **touch** a file that already holds module state, move that state in the same change.

## Decision

| Kind of state                                                         | Where                                                                                                                                                                                                                    |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Per-`mapId` protocol                                                  | `ensureMapDomainStore` / package `ensureMap*Store` — **map-domain-store** skill                                                                                                                                          |
| Process singleton already has `ensure*` / `get*Store`                 | **That bag** — add a field, do not open a second key. Same lib / same domain = **one** `getOrCreateStore` key                                                                                                            |
| New process / package singleton                                       | `getOrCreateStore('domain:name', () => …)` + export `ensure*` / `get*`                                                                                                                                                   |
| Vue/React **view** (selection, draft input, open/closed of one panel) | Component `ref` / `useState`, **or** a framework UI store (`defineStore` + `ref`/`reactive`/`computed` on Vue; `getOrCreateStore` + `useState` / `useSyncExternalStore` on React). Vue and React bags **need not match** |
| Per-async-chain log context                                           | `ZoneContextStorage` — **not** a store                                                                                                                                                                                   |
| Identity `WeakMap<object, …>` (GC with the instance)                  | Module `WeakMap` is OK                                                                                                                                                                                                   |
| Compile-time constants / lookup tables                                | `const` is OK                                                                                                                                                                                                            |

Never invent a parallel bag on `@hungpvq/shared` or `globalThis.foo` (exception: documented pins such as `ensureHungpvqDebugHost` → `__hungpvqDebug`).

## Prefer existing `ensure*`

Call the helper that already owns the domain. Do not `getOrCreateStore` a new key beside it.

| Helper                                                        | Bag / key                              | Use for                                                                            |
| ------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| `getLogDebugStore()`                                          | `log:debug`                            | Debug install, log mirror, errors, live events, instance registry (except WeakMap) |
| `useVueLogUiStore` / `ensureReactLogUiStore`                  | `log:vue-ui` / `log:react-ui`          | Framework Devtools UI — one bag per adapter lib (map-devtools reuses these)        |
| `getMapDebugStore()`                                          | `map:debug`                            | Map devtools install, dataset pin, error/tab dispose                               |
| `ensureHungpvqDebugHost()`                                    | pin `__hungpvqDebug`                   | Tabs, open, active tab                                                             |
| `ensureMapDomainStore(mapId, key)` / `ensureMap*Store(mapId)` | `map:core[mapId][key]`                 | Per-map protocol                                                                   |
| `getOrCreateStore` in map-core meta / registry                | `map:core:meta`, `map:registry:global` | True process singletons                                                            |
| Package `ensure*` you are editing                             | that return value                      | Any new field in the same domain                                                   |

New field on an existing bag:

```ts
const bag = getLogDebugStore(); // or ensureMapXStore(mapId)
bag.myFlag = true;
```

New process bag only when no `ensure*` fits. Same lib / same domain → **one key**. Add fields to the existing bag instead of `log:live` beside `log:debug`.

```ts
import { getOrCreateStore } from '@hungpvq/shared-store';

export const LOG_DEBUG_STORE_KEY = 'log:debug';

export function getLogDebugStore() {
  return getOrCreateStore(LOG_DEBUG_STORE_KEY, () => ({
    logs: [],
    liveEvents: [],
    listeners: new Set(),
  }));
}
```

`defineStore(id, setup)` is the lazy getter form of the same registry. React readers: `@hungpvq/shared-store/react` (`useStoreValue` / `defineStoreReact`).

## Forbidden (process state)

```ts
// ❌ module singleton
const events: DebugRecord[] = [];
let installed = false;
const listeners = new Set<() => void>();
let cached: Snapshot | null = null;

// ❌ second store for the same domain
getOrCreateStore('log:debug-extra', () => ({ … }));
```

```ts
// ✅
const bag = getLogDebugStore();
bag.installed = true;
```

`useSyncExternalStore` snapshot caches belong **on the store** (or derive from store fields) so HMR / two copies of the package share one bag. Do not keep a file-level `let cached`.

## Still OK as module locals

- `WeakMap` from a runtime object to an id
- Pure functions, constant `Set`/`Record` of keys
- In-function locals
- Test-only resets that **clear the store bag** (`reset*ForTests` → mutate/delete the `getOrCreateStore` entry, not a parallel `let`)

## Checklist when adding state

1. Search for `ensure*` / `get*Store` / `getOrCreateStore` in the same package (and `map-domain-store` if `mapId`).
2. Reuse that bag; add a typed field.
3. If none exists, add `KEY` + `ensure*` via `getOrCreateStore` (or domain factory). Export the getter; do not leak the raw `getOrCreateStore` call at every call site.
4. Subscribe/notify stays next to the bag (listeners on the bag, or `GlobalStoreService` subscribe).
5. Framework UI only binds the store — no second copy in `ref` / `useState` for the same process data.
