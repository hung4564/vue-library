# Stable API (`@hungpvq/shared-store`)

Runtime allowlist locked by `src/public-api.spec.ts`.

## Root (`.`)

| Symbol | Role |
|--------|------|
| `GlobalStoreService` | Singleton path store + subscribe (`globalThis.$_hungpv_store`) |
| `defineStore` | Lazy store factory by id/path (returns getter) |
| `getOrCreateStore` | Eager get-or-create (same backing store; for services / class statics / process singletons) |
| `createStoreRegistryPlugin` | Vue `app.use` plugin |
| `useStoreRegistry` | Resolve registry instance |

**SoT:** all process / app stores go through `getOrCreateStore` / `defineStore` / `GlobalStoreService` on `globalThis.$_hungpv_store` (browser + SSR Node, process-wide — not per-request ALS).

## `./react`

React hooks (`useStoreValue`, `useStoreSubscribe`, `defineStoreReact`) — separate entry; not part of the root lock.
