# GotoControl

## Usecase

- Jump to specific coordinates or saved places via UI.
- Enable quick navigation between bookmarks in analytic dashboards.

## Props

<!--@include: ./props.md-->

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map, GotoControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <GotoControl />
  </Map>
</template>
```

### React

```tsx
import { Map, GotoControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <GotoControl />
</Map>
```
