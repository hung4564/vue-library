# Map Devtools

Generic debug tabs (**Store**, **Live**, **Logs**, **Errors**) live in `@hungpvq/shared-log` + `@hungpvq/vue-shared-log` / `@hungpvq/react-shared-log`. Map packages only host the popup and add the **Dataset** tab.

| Package                       | Bootstrap           | Panel                                   |
| ----------------------------- | ------------------- | --------------------------------------- |
| `@hungpvq/vue-map-devtools`   | `installDevtools()` | Mount `<Devtools />` **inside** `<Map>` |
| `@hungpvq/react-map-devtools` | `installDevtools()` | Mount `<Devtools />` **inside** `<Map>` |

`installDevtools()` calls `installDebug()` from `@hungpvq/shared-log` (default IndexedDB on `log:debug`), registers built-in tabs, wires `errorHandler.onError` → `reportDebugError`, and (when `map-dataset` is present) `installDatasetDebug()` + pin-registers the Dataset tab. F12: `window.__hungpvqDebug` (tabs) and `window.__hungpvqDatasetDebug` (dataset inspect).

Standalone (no map): mount `DevtoolsShell` from `*-shared-log` and register extra tabs on `globalThis.__hungpvqDebug` — see [`@hungpvq/shared-log` README](../../../share/log/README.md). Demo: `#/shared-log`.

## Dataset tab

| Pane    | Role                                      |
| ------- | ----------------------------------------- |
| Roots   | Pick / pin a dataset from the store tree  |
| Inspect | Node hierarchy, fields, find-by-type      |
| Menus   | Resolved menus by placement + detail JSON |

Menus without `id` show generated debug keys (`anon:…:<index>`, `idGenerated`). Shared dataset CSS is owned by `@hungpvq/map-debug` (`.dataset-viewer*`); generic chrome is `@hungpvq/shared-log/style.css`.

See [`@hungpvq/map-debug` README](../../../map-debug/README.md) for the console API and the Debug-dataset menu item.

## Mount (Map control only)

`<Devtools />` is a map control (`DEVTOOLS_CONTROL.id` = `mapDevtools`) that opens a **`DraggableItemPopup`**. Mount it **inside** `<Map>` — not in the app shell.

```vue
<Map>
  <Devtools position="bottom-right" />
</Map>
```

```tsx
<Map>
  <Devtools position="bottom-right" />
</Map>
```

`DevtoolsControl` is also exported (same UI path).

Request Flow (Logs tab → Flow) is a self-contained overlay in `*-shared-log` (no Map modal).

## Bootstrap (Vue + React)

```ts
import { Devtools, installDevtools, uninstallDevtools } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

installDevtools();
// or: installDevtools({ logStore: 'memory' })
// or: installDevtools({ logStore: { kind: 'memory', limit: 5_000 } })
// or: installDevtools({ logStore: myCustomLogDataStore })
```

Log store config lives on **`getLogDebugStore()`** (`LOG_DEBUG_STORE_KEY = 'log:debug'`) via `configureDebugLogStore` from `@hungpvq/shared-log` — not on `map:debug`.

```ts
import { configureDebugLogStore } from '@hungpvq/shared-log';

configureDebugLogStore({ kind: 'memory', limit: 2_000 });
installDevtools();
```

`map:debug` keeps only the dataset pin + `installed` flag (`getMapDebugStore()`).

## Stable API

| Export                                          | Notes                                                     |
| ----------------------------------------------- | --------------------------------------------------------- |
| `Devtools`                                      | Map control + `DraggableItemPopup` (mount inside `<Map>`) |
| `DevtoolsControl`                               | Explicit map-control popup (same as `Devtools`)           |
| `DEVTOOLS_CONTROL`                              | `{ id: 'mapDevtools' }` (from `@hungpvq/map-debug`)       |
| `installDevtools` / `uninstallDevtools`         | Bootstrap (`installDevtools({ logStore })` optional)      |
| `openMapDevtoolsErrors`                         | `openDebugTab('errors')`                                  |

Generic helpers (`configureDebugLogStore`, `reportDebugError`, `openDebugTab`, `setDebugOpen`, …) come from `@hungpvq/shared-log`. Runtime lock: `public-api.spec.ts` in each adapter package.

## Demos

- Viewport map: `installDevtools()` + `<DevtoolsControl />` in `apps/vue/demo-map` and `apps/react/demo-map`
- Standalone log: `#/shared-log` mounts `DevtoolsShell` and pin-registers `app:demo` (vendor `ensure-debug-host`, no `registerDebugTab` import)

See also [Stable API](./stable-api.md) · [Map store keys](./map-store.md) · [Error handling](./error-handling.md) · [`@hungpvq/shared-log` README](../../../share/log/README.md).
