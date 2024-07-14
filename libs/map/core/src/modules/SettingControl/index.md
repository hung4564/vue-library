---
category: Component
package: vue-map
---

# Setting Control

<FunctionInfo :frontmatter="$frontmatter" fn="SettingControl" />

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
import { Map, SettingControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <SettingControl />
  </Map>
</template>
```
