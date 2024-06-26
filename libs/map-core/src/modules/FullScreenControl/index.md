---
category: Component
package: vue-map
---

# FullScreen Control

<FunctionInfo :frontmatter="$frontmatter" fn="FullScreenControl" />

## Props

<!--@include: ../ModuleContainer/props.md-->

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
