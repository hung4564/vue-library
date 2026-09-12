# Stable API (`@hungpvq/shared-store`)

Runtime allowlist locked by `src/public-api.spec.ts`.

## Root (`.`)

| Symbol | Role |
|--------|------|
| `GlobalStoreService` | Singleton path store + subscribe |
| `defineStore` | Lazy store factory by id/path |
| `createStoreRegistryPlugin` | Vue `app.use` plugin |
| `useStoreRegistry` | Resolve registry instance |

## `./react`

React hooks (`useStoreValue`, `useStoreSubscribe`, `defineStoreReact`) — separate entry; not part of the root lock.
