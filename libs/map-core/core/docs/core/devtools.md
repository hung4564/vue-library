# Map Devtools

Debug panel for map apps: **Store**, **Logs**, and **Errors**.

| Package | Bootstrap | Panel |
|---------|-----------|-------|
| `@hungpvq/vue-map-devtools` | `app.use(DevtoolsPlugin)` | Global `Devtools` and/or `<Devtools />` |
| `@hungpvq/react-map-devtools` | `installDevtools()` | Mount `<Devtools />` yourself |

Both packages export `./style.css`. Peers include `@hungpvq/map-core`, the matching framework map-core / map-devtools peers (`@hungpvq/vue-draggable` or `@hungpvq/react-draggable`), and `@hungpvq/shared-log`.

## Mobile

On viewports **≤640px** (same tablet breakpoint as map):

- If a map `DraggableContainer` is present (`map-draggable-*`, or pass `containerId`), the open panel uses **`DraggableItemBottom`** — the same bottom sheet shell as map controls (45% height, expand to full, close / Escape).
- If no container is available yet, a CSS bottom sheet fallback (~85vh) is used.

Desktop keeps the floating FAB + fixed panel.

```vue
<Devtools />
<!-- or pin to a specific map drag container -->
<Devtools container-id="map-draggable-my-map" />
```

```tsx
<Devtools />
<Devtools containerId="map-draggable-my-map" />
```

## Vue

```ts
import { createApp } from 'vue';
import { DevtoolsPlugin, uninstallDevtools } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

const app = createApp(App);
app.use(DevtoolsPlugin);
```

`DevtoolsPlugin` registers the global `Devtools` component, attaches a log adapter, and installs global error capture via `errorHandler` from `@hungpvq/map-core` (see [Error handling](./error-handling.md)). Call `uninstallDevtools()` to tear down capture.

## React

```tsx
import { Devtools, installDevtools, uninstallDevtools } from '@hungpvq/react-map-devtools';
import '@hungpvq/react-map-devtools/style.css';

installDevtools();

// In the tree:
<Devtools />
```

`installDevtools()` does not register a component — mount `<Devtools />` explicitly. Call `uninstallDevtools()` to tear down capture.

## Stable API

| Export | Vue | React |
|--------|-----|-------|
| Panel | `Devtools` | `Devtools` |
| Bootstrap | `DevtoolsPlugin` | `installDevtools` |
| Teardown | `uninstallDevtools` | `uninstallDevtools` |
| Log adapter | `DevtoolLogAdapter`, `devtoolLogAdapter` | same |
| State | `devtoolState`, `getDevtoolState`, `useDevtoolState`, `subscribeDevtoolState` | same |
| Actions | `toggleDevtoolOpen`, `setDevtoolActiveTab`, `clearDevtoolLogs`, `clearDevtoolErrors` | same |

Runtime lock: `libs/vue/map-devtools/src/public-api.spec.ts`, `libs/react/map-devtools/src/public-api.spec.ts`.

## Demos

- Vue: `apps/vue/demo-map` (`DevtoolsPlugin` in `main.ts`)
- React: `apps/react/demo-map` (`installDevtools()` in `main.tsx`)

See also [Stable API](./stable-api.md) · [Map store](./map-store.md) · [Error handling](./error-handling.md).
