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

`installDevtools()` wires `@hungpvq/shared-log` into the panel, captures map errors for the Errors tab, and installs the dataset debug bridge when available. Mount the panel **inside** `<Map>`:

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { Devtools } from '@hungpvq/vue-map-devtools';
</script>

<template>
  <Map>
    <Devtools position="bottom-right" />
  </Map>
</template>
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

See [Stable API](../../map-core/core/docs/core/stable-api.md) and `public-api.spec.ts`.

## Demo

`apps/vue/demo-map` — `installDevtools()` in `src/main.ts`; every `<Map>` mounts `<DevtoolsControl position="bottom-right" />`.

Docs hub: [Map Devtools](../../map-core/core/docs/core/devtools.md).
