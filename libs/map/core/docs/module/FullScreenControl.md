# FullScreenControl

## Usecase

- Present the map in full screen for demos or dashboards.
- Improve focus on the map by hiding surrounding layout when needed.

## Props

<!--@include: ./props.md-->

and

| Prop   | Description | Type         | Required | Default Value |
| ------ | ----------- | ------------ | -------- | ------------- |
| `type` |             | `body`,`map` | `false`  | `body`        |

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { Map, FullScreenControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <FullScreenControl />
  </Map>
</template>
```
