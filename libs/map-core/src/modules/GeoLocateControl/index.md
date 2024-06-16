---
category: Component
package: vue-map
---

# GeoLocate Control

<FunctionInfo :frontmatter="$frontmatter" fn="GeoLocateControl" />

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
import { Map, GeoLocateControl } from '@hungpv97/vue-map-core';
import '@hungpv97/vue-map/style.css';
</script>

<template>
  <Map>
    <GeoLocateControl />
  </Map>
</template>
```
