# `@hungpvq/react-map-devtools`

React debug panel for `@hungpvq/react-map-core` (store, logs, errors).

## Install

```bash
npm install @hungpvq/react-map-devtools
```

Peers: `@hungpvq/map-core`, `@hungpvq/react-map-core`, `@hungpvq/react-draggable`, `@hungpvq/shared-log`, `@hungpvq/shared-store`, React 18+.

## Styles

```ts
import '@hungpvq/react-map-devtools/style.css';
```

## Usage

Call `installDevtools()` once at bootstrap (wires `@hungpvq/shared-log` into the panel and captures map errors). Mount `<Devtools />` where you want the panel:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Devtools, installDevtools } from '@hungpvq/react-map-devtools';
import '@hungpvq/react-map-devtools/style.css';
import App from './App';

installDevtools();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Devtools />
    {/* Map control popup (inside <Map>): <Devtools mode="control" position="bottom-right" /> */}
    {/* <Devtools containerId="map-draggable-my-map" /> */}
  </StrictMode>,
);
```

On mobile (≤640px), overlay mode uses `DraggableItemBottom` when a map drag container exists. Use `mode="control"` for a map corner button + `DraggableItemPopup`.

Tear down global error capture with `uninstallDevtools()` when the host app unmounts (tests / HMR).

## Stable API

| Export | Role |
|--------|------|
| `installDevtools` | Bootstrap log adapter + global error capture |
| `uninstallDevtools` | Remove global error capture |
| `Devtools` | Panel UI (`mode?: 'overlay' \| 'control'`) |
| `DevtoolsControl` | Map control + popup (same as `mode="control"`) |
| `DEVTOOLS_CONTROL` | `{ id: 'mapDevtools' }` |

Experimental root exports (store helpers / hooks such as `useDevtoolState`, `getDevtoolState`, …) may change in a minor — see [Stable API](../../map-core/core/docs/core/stable-api.md) and `public-api.spec.ts`.

## Demo

`apps/react/demo-map` — `installDevtools()` in `src/main.tsx`, `<Devtools />` in the app shell.

Docs hub: [Map Devtools](../../map-core/core/docs/core/devtools.md).
