---
category: Component
package: vue-map
---

# MouseCoordinates Control

<FunctionInfo :frontmatter="$frontmatter" fn="MouseCoordinatesControl" />

## Props

<!--@include: ../ModuleContainer/props.md-->

and

| Prop              | Description | Type      | Required | Default Value |
| ----------------- | ----------- | --------- | -------- | ------------- |
| `hideCrsSelect`   |             | `boolean` | `false`  | false         |
| `hideScale`       |             | `boolean` | `false`  | false         |
| `hideCoordinates` |             | `boolean` | `false`  | false         |
| `hideZoom`        |             | `boolean` | `false`  | false         |

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { Map, MouseCoordinatesControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <MouseCoordinatesControl />
  </Map>
</template>
```
