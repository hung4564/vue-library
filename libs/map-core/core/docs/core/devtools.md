# Map Devtools

Debug panel for map apps: **Store**, **Logs**, **Errors**, and **Dataset** (Inspect + Menus).

| Package | Bootstrap | Panel |
|---------|-----------|-------|
| `@hungpvq/vue-map-devtools` | `installDevtools()` | Mount `<Devtools />` **inside** `<Map>` |
| `@hungpvq/react-map-devtools` | `installDevtools()` | Mount `<Devtools />` **inside** `<Map>` |

Both packages export `./style.css` (imports shared chrome from `@hungpvq/map-debug`). Peers include `@hungpvq/map-core`, the matching framework map-core / map-devtools peers (`@hungpvq/vue-draggable` or `@hungpvq/react-draggable`), and `@hungpvq/shared-log`. When `map-dataset` is present, `installDevtools()` also installs `@hungpvq/map-debug/dataset` (canonical pin `map:debug.dataset`; F12 alias `window.__hungpvqDatasetDebug`).

## Dataset tab

| Pane | Role |
|------|------|
| Roots | Pick / pin a dataset from the store tree |
| Inspect | Node hierarchy, fields, find-by-type |
| Menus | Resolved menus by placement + detail JSON |

Menus without `id` show generated debug keys (`anon:…:<index>`, `idGenerated`). Selection is summary-based so anonymous items stay clickable. Shared layout/CSS is owned by `@hungpvq/map-debug` (SoT); Vue/React only host the UI.

See [`@hungpvq/map-debug` README](../../../map-debug/README.md) for console API and the Debug-dataset menu item.

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

`DevtoolsControl` is also exported (same UI path). Global floating overlay / `mode="overlay"` has been removed (**breaking** for prior overlay-only mounts).

Request Flow (Logs tab → detail) opens a `DraggableModal` on `map-draggable-${mapId}` and renders a nested call / emit / handler tree from `flowKind` / `flowDepth` / `eventName`.

## Bootstrap (Vue + React)

```ts
import { Devtools, installDevtools, uninstallDevtools } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

installDevtools();
// mount <Devtools /> inside <Map>
```

`installDevtools()` attaches a log adapter and installs global error capture via `errorHandler` from `@hungpvq/map-core`. Call `uninstallDevtools()` to tear down capture.

## Stable API

| Export | Notes |
|--------|-------|
| `Devtools` | Map control + `DraggableItemPopup` (mount inside `<Map>`) |
| `DevtoolsControl` | Explicit map-control popup (same as `Devtools`) |
| `DEVTOOLS_CONTROL` | `{ id: 'mapDevtools' }` |
| `installDevtools` / `uninstallDevtools` | Bootstrap |
| `setDevtoolOpen` / `toggleDevtoolOpen` / `openMapDevtoolsErrors` | Open helpers |

Runtime lock: `public-api.spec.ts` in each adapter package.

## Demos

- Vue: `apps/vue/demo-map` — `installDevtools()` in `main.ts`; every `<Map>` includes `<DevtoolsControl position="bottom-right" />`
- React: `apps/react/demo-map` — same pattern

See also [Stable API](./stable-api.md) · [Error handling](./error-handling.md).
