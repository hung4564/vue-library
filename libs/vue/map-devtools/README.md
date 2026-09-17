# `@hungpvq/vue-map-devtools`

Vue 3 debug panel for `@hungpvq/vue-map-core` (store, logs, errors, dataset inspect/menus).

## Install

```bash
npm install @hungpvq/vue-map-devtools
```

Peers: `@hungpvq/map-core`, `@hungpvq/vue-map-core`, `@hungpvq/vue-draggable`, `@hungpvq/shared-log`, `@hungpvq/shared-store`, Vue 3.3+. Optional peer `@hungpvq/map-dataset` enables the Dataset tab via `@hungpvq/map-debug/dataset`.

## Styles

```ts
import '@hungpvq/vue-map-devtools/style.css';
```

Styles re-export shared chrome from `@hungpvq/map-debug` (Dataset Inspect/Menus layout included).

## Usage

```ts
import { createApp } from 'vue';
import { Devtools, installDevtools } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

installDevtools();
const app = createApp(App);
```

`installDevtools()` wires `@hungpvq/shared-log` into the panel, captures map errors for the Errors tab, and installs the dataset debug bridge when available. Mount the panel yourself:

```vue
<script setup lang="ts">
import { Devtools } from '@hungpvq/vue-map-devtools';
</script>

<template>
  <Devtools />
  <!-- Map control popup (mount inside <Map>): -->
  <!-- <Devtools mode="control" position="bottom-right" /> -->
  <!-- <Devtools container-id="map-draggable-my-map" /> -->
</template>
```

On mobile (≤640px), overlay mode is a free-floating panel you can **drag** (same pointer pattern as the demo help guide): grab the FAB when closed, or the “Map Devtools” drag bar when open. Use `mode="control"` to render as a map corner control + `DraggableItemPopup`.

Tear down global error capture with `uninstallDevtools()` when the host app unmounts (tests / HMR).

## Dataset tab

Roots → Inspect → Menus. Anonymous menus get debug-only `anon:…` ids (`idGenerated`). Details: [map-debug README](../../map-core/map-debug/README.md).

## Stable API

| Export | Role |
|--------|------|
| `installDevtools` | Bootstrap log adapter + global error capture |
| `uninstallDevtools` | Remove global error capture |
| `Devtools` | Panel UI (`mode?: 'overlay' \| 'control'`) |
| `DevtoolsControl` | Map control + popup (same as `mode="control"`) |
| `DEVTOOLS_CONTROL` | `{ id: 'mapDevtools' }` |

See [Stable API](../../map-core/core/docs/core/stable-api.md) and `public-api.spec.ts`.

## Demo

`apps/vue/demo-map` — `installDevtools()` in `src/main.ts`, `<Devtools />` in the app shell.

Docs hub: [Map Devtools](../../map-core/core/docs/core/devtools.md).
