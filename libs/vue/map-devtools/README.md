# `@hungpvq/vue-map-devtools`

Vue 3 debug panel for `@hungpvq/vue-map-core` (store, logs, errors).

## Install

```bash
npm install @hungpvq/vue-map-devtools
```

Peers: `@hungpvq/map-core`, `@hungpvq/vue-map-core`, `@hungpvq/shared-log`, `@hungpvq/shared-store`, Vue 3.3+.

## Styles

```ts
import '@hungpvq/vue-map-devtools/style.css';
```

## Usage

```ts
import { createApp } from 'vue';
import { DevtoolsPlugin } from '@hungpvq/vue-map-devtools';
import '@hungpvq/vue-map-devtools/style.css';

const app = createApp(App);
app.use(DevtoolsPlugin);
```

`DevtoolsPlugin` registers a global `Devtools` component, wires `@hungpvq/shared-log` into the panel, and captures map errors for the Errors tab.

You can also mount the panel yourself:

```vue
<script setup lang="ts">
import { Devtools } from '@hungpvq/vue-map-devtools';
</script>

<template>
  <Devtools />
</template>
```

Tear down global error capture with `uninstallDevtools()` when the host app unmounts (tests / HMR).

## Stable API

| Export | Role |
|--------|------|
| `DevtoolsPlugin` | Vue plugin: log adapter + error capture + global `Devtools` |
| `uninstallDevtools` | Remove global error capture |
| `Devtools` | Panel UI (Store / Logs / Errors) |

Experimental: `DevtoolLogAdapter` — see [Stable API](../../map-core/core/docs/core/stable-api.md) and `public-api.spec.ts`.

## Demo

`apps/vue/demo-map` — `app.use(DevtoolsPlugin)` in `src/main.ts`, optional `<Devtools />` in the app shell.

Docs hub: [Map Devtools](../../map-core/core/docs/core/devtools.md).
