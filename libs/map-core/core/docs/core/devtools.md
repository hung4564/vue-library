# Map Devtools

Debug panel for map apps: **Store**, **Logs**, and **Errors**.

| Package | Bootstrap | Panel |
|---------|-----------|-------|
| `@hungpvq/vue-map-devtools` | `installDevtools()` | Mount `<Devtools />` |
| `@hungpvq/react-map-devtools` | `installDevtools()` | Mount `<Devtools />` |

Both packages export `./style.css`. Peers include `@hungpvq/map-core`, the matching framework map-core / map-devtools peers (`@hungpvq/vue-draggable` or `@hungpvq/react-draggable`), and `@hungpvq/shared-log`.

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

- If a map `DraggableContainer` is present (`map-draggable-*`, or pass `containerId`), the open panel uses **`DraggableItemBottom`**.
- If no container is available yet, a CSS bottom sheet fallback (~85vh) is used.

```vue
<Devtools container-id="map-draggable-my-map" />
```

```tsx
<Devtools containerId="map-draggable-my-map" />
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
