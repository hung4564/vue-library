---
category: Component
package: vue-map
---

# Goto Control

<FunctionInfo :frontmatter="$frontmatter" fn="GotoControl" />

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
import { Map, GotoControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <GotoControl />
  </Map>
</template>
```
