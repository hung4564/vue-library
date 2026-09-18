# Map Devtools

Debug panel for map apps: **Store**, **Logs**, **Errors**, and **Dataset** (Inspect + Menus).

| Package | Bootstrap | Panel |
|---------|-----------|-------|
| `@hungpvq/vue-map-devtools` | `installDevtools()` | Mount `<Devtools />` |
| `@hungpvq/react-map-devtools` | `installDevtools()` | Mount `<Devtools />` |

Both packages export `./style.css` (imports shared chrome from `@hungpvq/map-debug`). Peers include `@hungpvq/map-core`, the matching framework map-core / map-devtools peers (`@hungpvq/vue-draggable` or `@hungpvq/react-draggable`), and `@hungpvq/shared-log`. When `map-dataset` is present, `installDevtools()` also installs `@hungpvq/map-debug/dataset` (`window.__hungpvqDatasetDebug`).

## Dataset tab

| Pane | Role |
|------|------|
| Roots | Pick / pin a dataset from the store tree |
| Inspect | Node hierarchy, fields, find-by-type |
| Menus | Resolved menus by placement + detail JSON |

Menus without `id` show generated debug keys (`anon:…:<index>`, `idGenerated`). Selection is summary-based so anonymous items stay clickable. Shared layout/CSS is owned by `@hungpvq/map-debug` (SoT); Vue/React only host the UI.

See [`@hungpvq/map-debug` README](../../../map-debug/README.md) for console API and the Debug-dataset menu item.

## Display modes

| `mode` | Behavior | Where to mount |
|--------|----------|----------------|
| `overlay` (default) | Fixed FAB + floating panel; mobile uses `DraggableItemBottom` when a map drag container exists | Anywhere (e.g. app shell) |
| `control` | Map corner control (`DEVTOOLS_CONTROL.id` = `mapDevtools`) + **`DraggableItemPopup`** | Inside `<Map>` |

```vue
<!-- App shell -->
<Devtools />

<!-- Or as a map control popup -->
<Map>
  <Devtools mode="control" position="bottom-right" />
</Map>
```

```tsx
<Devtools />

<Map>
  <Devtools mode="control" position="bottom-right" />
</Map>
```

`DevtoolsControl` is also exported (same as `mode="control"`).

## Mobile (overlay)

On viewports **≤640px** (same tablet breakpoint as map):

- Pass **`containerId`** (`map-draggable-<mapId>`) and/or **`mapId`** so the panel attaches to the correct map. Without either, there is no document-wide first-match — a CSS bottom sheet fallback (~85vh) is used.
- `resolveMapDragContainerId(explicit, mapId)` prefers `explicit`, else derives `map-draggable-${mapId}`.

```vue
<Devtools container-id="map-draggable-my-map" />
<!-- or -->
<Devtools map-id="my-map" />
```

```tsx
<Devtools containerId="map-draggable-my-map" />
{/* or */}
<Devtools mapId="my-map" />
```

## Bootstrap (Vue + React)

```ts
import { Devtools, installDevtools, uninstallDevtools } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

installDevtools();
// mount <Devtools /> or <Devtools mode="control" /> inside Map
```

`installDevtools()` attaches a log adapter and installs global error capture via `errorHandler` from `@hungpvq/map-core`. Call `uninstallDevtools()` to tear down capture.

## Stable API

| Export | Notes |
|--------|-------|
| `Devtools` | `mode?: 'overlay' \| 'control'` |
| `DevtoolsControl` | Explicit map-control popup |
| `DEVTOOLS_CONTROL` | `{ id: 'mapDevtools' }` |
| `installDevtools` / `uninstallDevtools` | Bootstrap |
| `setDevtoolOpen` / `toggleDevtoolOpen` / `openMapDevtoolsErrors` | Open helpers |

Runtime lock: `public-api.spec.ts` in each adapter package.

## Demos

- Vue: `apps/vue/demo-map`
- React: `apps/react/demo-map`

See also [Stable API](./stable-api.md) · [Error handling](./error-handling.md).
