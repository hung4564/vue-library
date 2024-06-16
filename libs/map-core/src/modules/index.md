---
category: Container
---

# Map

<FunctionInfo fn="Map" />

## Props

| Prop                | Description | Type     | Required | Default Value |
| ------------------- | ----------- | -------- | -------- | ------------- |
| `mapboxAccessToken` |             | `string` | `fasle`  | --            |
| `initOptions`       |             | `object` | `fasle`  | --            |
| `dragId`            |             | `string` | `fasle`  | --            |

## Events

| Name          | Description                |
| ------------- | -------------------------- |
| `map-loaded`  | `(map: MapSimple) => void` |
| `map-destroy` | `(map: MapSimple) => void` |

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map> </Map>
</template>
```
