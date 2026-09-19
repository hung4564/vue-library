# `@hungpvq/react-map-devtools`

React debug panel for `@hungpvq/react-map-core` (store, logs, errors, dataset inspect/menus).

## Install

```bash
npm install @hungpvq/react-map-devtools
```

Peers: `@hungpvq/map-core`, `@hungpvq/react-map-core`, `@hungpvq/react-draggable`, `@hungpvq/shared-log`, `@hungpvq/shared-store`, React 18+. Optional peer `@hungpvq/map-dataset` enables the Dataset tab via `@hungpvq/map-debug/dataset`.

## Styles

```ts
import '@hungpvq/react-map-devtools/style.css';
```

Styles re-export shared chrome from `@hungpvq/map-debug` (Dataset Inspect/Menus layout included).

## Usage

Call `installDevtools()` once at bootstrap (wires `@hungpvq/shared-log` into the panel, captures map errors, and installs the dataset debug bridge when available). Mount `<Devtools />` **inside** `<Map>`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Map } from '@hungpvq/react-map-core';
import { Devtools, installDevtools } from '@hungpvq/react-map-devtools';
import '@hungpvq/react-map-devtools/style.css';
import App from './App';

installDevtools();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Inside a map view:
// <Map>
//   <Devtools position="bottom-right" />
// </Map>
```

Uses map control id `mapDevtools` + `DraggableItemPopup` (not an App-global overlay).

Tear down global error capture with `uninstallDevtools()` when the host app unmounts (tests / HMR).

## Dataset tab

Roots → Inspect → Menus. Anonymous menus get debug-only `anon:…` ids (`idGenerated`). Details: [map-debug README](../../map-core/map-debug/README.md).

## Stable API

| Export | Role |
|--------|------|
| `installDevtools` | Bootstrap log adapter + global error capture |
| `uninstallDevtools` | Remove global error capture |
| `Devtools` | Map control + popup (mount inside `<Map>`) |
| `DevtoolsControl` | Same as `Devtools` |
| `DEVTOOLS_CONTROL` | `{ id: 'mapDevtools' }` |

Experimental root exports (store helpers / hooks such as `useDevtoolState`, `getDevtoolState`, …) may change in a minor — see [Stable API](../../map-core/core/docs/core/stable-api.md) and `public-api.spec.ts`.

## Demo

`apps/react/demo-map` — `installDevtools()` in `src/main.tsx`; every `<Map>` mounts `<DevtoolsControl position="bottom-right" />`.

Docs hub: [Map Devtools](../../map-core/core/docs/core/devtools.md).
