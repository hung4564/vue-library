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
import { Map } from '@hungpv97/vue-map-core';
import '@hungpv97/vue-map/style.css';
</script>

<template>
  <Map> </Map>
</template>
```
