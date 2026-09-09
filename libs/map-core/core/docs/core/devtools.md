# Map Devtools

Debug panel for map apps: **Store**, **Logs**, and **Errors**.

| Package | Bootstrap | Panel |
|---------|-----------|-------|
| [`@hungpvq/vue-map-devtools`](../../../vue/map-devtools/) | `app.use(DevtoolsPlugin)` | Global `Devtools` and/or `<Devtools />` |
| [`@hungpvq/react-map-devtools`](../../../react/map-devtools/) | `installDevtools()` | Mount `<Devtools />` yourself |

Both packages export `./style.css`. Peers include `@hungpvq/map-core`, the matching framework map-core, and `@hungpvq/shared-log`.

## Vue

```ts
import { createApp } from 'vue';
import { DevtoolsPlugin, uninstallDevtools } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

const app = createApp(App);
app.use(DevtoolsPlugin);
```

`DevtoolsPlugin` registers the global `Devtools` component, attaches a log adapter, and installs global error capture via `errorHandler` from `@hungpvq/map-core`. Call `uninstallDevtools()` to tear down capture.

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

| Package | Stable exports |
|---------|----------------|
| `@hungpvq/vue-map-devtools` | `Devtools`, `DevtoolsPlugin`, `uninstallDevtools` |
| `@hungpvq/react-map-devtools` | `Devtools`, `installDevtools`, `uninstallDevtools` |

Runtime lock: `libs/vue/map-devtools/src/public-api.spec.ts`, `libs/react/map-devtools/src/public-api.spec.ts`.

## Experimental (React)

React also exposes experimental store helpers on the root barrel (may change in a minor): `useDevtoolState`, `getDevtoolState`, `subscribeDevtoolState`, `toggleDevtoolOpen`, `setDevtoolActiveTab`, `clearDevtoolLogs`, `clearDevtoolErrors`, `devtoolState`, `devtoolLogAdapter`, `DevtoolLogAdapter`.

Vue experimental surface is thinner: `DevtoolLogAdapter` only.

## Demos

- Vue: `apps/vue/demo-map` (`DevtoolsPlugin` in `main.ts`)
- React: `apps/react/demo-map` (`installDevtools()` in `main.tsx`)

See also [Stable API](./stable-api.md).
