---
category: Component
package: vue-map
---

# Crs Control

<FunctionInfo :frontmatter="$frontmatter" fn="CrsControl" />

## Props

<!--@include: ../ModuleContainer/props.md-->

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { Map, CrsControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <CrsControl />
  </Map>
</template>
```
