# `@hungpvq/vue-map-devtools`

Vue 3 debug panel for `@hungpvq/vue-map-core` (store, logs, errors).

## Install

```bash
npm install @hungpvq/vue-map-devtools
```

Peers: `@hungpvq/map-core`, `@hungpvq/vue-map-core`, `@hungpvq/vue-draggable`, `@hungpvq/shared-log`, `@hungpvq/shared-store`, Vue 3.3+.

## Styles

```ts
import '@hungpvq/vue-map-devtools/style.css';
```

## Usage

```ts
import { createApp } from 'vue';
import { Devtools, installDevtools } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

installDevtools();
const app = createApp(App);
```

`installDevtools()` wires `@hungpvq/shared-log` into the panel and captures map errors for the Errors tab (same as React). Mount the panel yourself:

```vue
<script setup lang="ts">
import { Devtools } from '@hungpvq/vue-map-devtools';
</script>

<template>
  <Devtools />
  <!-- optional: pin bottom sheet to a map DraggableContainer -->
  <!-- <Devtools container-id="map-draggable-my-map" /> -->
</template>
```

On mobile (≤640px), the open panel uses the map `DraggableItemBottom` sheet when a `map-draggable-*` container exists (or `containerId` is set); otherwise a CSS sheet fallback. Desktop keeps the floating panel.

Tear down global error capture with `uninstallDevtools()` when the host app unmounts (tests / HMR).

Deprecated: `app.use(DevtoolsPlugin)` still works (calls `installDevtools` + registers a global `Devtools` component). Prefer `installDevtools` + import `<Devtools />`.

## Stable API

| Export | Role |
|--------|------|
| `installDevtools` | Bootstrap log adapter + global error capture |
| `uninstallDevtools` | Remove global error capture |
| `Devtools` | Panel UI (Store / Logs / Errors) |
| `DevtoolsPlugin` | **Deprecated** — prefer `installDevtools` |

Experimental: `DevtoolLogAdapter` — see [Stable API](../../map-core/core/docs/core/stable-api.md) and `public-api.spec.ts`.

## Demo

`apps/vue/demo-map` — `installDevtools()` in `src/main.ts`, `<Devtools />` in the app shell.

Docs hub: [Map Devtools](../../map-core/core/docs/core/devtools.md).
