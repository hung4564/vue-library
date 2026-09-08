# Vue Map Devtools

> Vue 3 debug panel for `@hungpvq/vue-map-core` (store, logs, errors)

## Installation

```bash
npm install @hungpvq/vue-map-devtools
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
