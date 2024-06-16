---
category: Component
package: vue-map
---

# Zoom Control

<FunctionInfo :frontmatter="$frontmatter" fn="ZoomControl" />

## Props

<!--@include: ../ModuleContainer/props.md-->

and

| Prop          | Description | Type      | Required | Default Value |
| ------------- | ----------- | --------- | -------- | ------------- |
| `showCompass` |             | `boolean` | `fasle`  | `true`        |
| `showZoom`    |             | `boolean` | `fasle`  | `true`        |

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { Map, ZoomControl } from '@hungpv97/vue-map-core';
import '@hungpv97/vue-map/style.css';
</script>

<template>
  <Map>
    <ZoomControl />
  </Map>
</template>
```
