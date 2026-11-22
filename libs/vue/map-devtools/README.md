# `@hungpvq/vue-map-devtools`

Vue 3 map host for the shared-log Devtools shell, plus pin-registered Dataset and Draggable tabs.

## Install

```bash
npm install @hungpvq/vue-map-devtools
```

Peers: `@hungpvq/map-core`, `@hungpvq/vue-map-core`, `@hungpvq/vue-draggable`, `@hungpvq/vue-shared-log`, `@hungpvq/shared-log`, `@hungpvq/shared-store`, Vue 3.3+. Optional peer `@hungpvq/map-dataset` enables the Dataset tab via `@hungpvq/map-debug/dataset`.

## Styles

```ts
import '@hungpvq/vue-map-devtools/style.css';
```

Styles import generic chrome from `@hungpvq/vue-shared-log` and Dataset layout from `@hungpvq/map-debug`.

## Usage

```ts
import { createApp } from 'vue';
import { Devtools } from '@hungpvq/vue-map-devtools';
import { installDevtools } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

installDevtools();
// or with tab configuration:
// installDevtools({ tabs: ['store', 'logs', 'draggable'] })
// installDevtools({ tabs: { live: false, errors: false } })
// installDevtools({ disabledTabs: ['live'] })
// or log store: installDevtools({ logStore: 'memory' | customStore | { kind, limit? } })
const app = createApp(App);
```

`installDevtools()` calls `installDebug()` (default **IndexedDB** on `log:debug`), registers built-in tabs, captures map errors for the Errors tab, and pin-registers Dataset when `map-dataset` is available. Mount the panel **inside** `<Map>`:

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

## Draggable tab

Declared in `@hungpvq/vue-draggable`. Lists items, toggles show, moves sidebar/drawer location, and shows component vs function origin.

## Stable API

| Export              | Role                                         |
| ------------------- | -------------------------------------------- |
| `installDevtools`   | Bootstrap log adapter + global error capture |
| `uninstallDevtools` | Remove global error capture                  |
| `Devtools`          | Map control + popup (mount inside `<Map>`)   |
| `DevtoolsControl`   | Same as `Devtools`                           |

See [Stable API](../../map-core/core/docs/core/stable-api.md) and `public-api.spec.ts`.

## Demo

`apps/vue/demo-map` — `installDevtools()` in `src/main.ts`; every `<Map>` mounts `<DevtoolsControl position="bottom-right" />`.

Docs hub: [Map Devtools](../../map-core/core/docs/core/devtools.md).
