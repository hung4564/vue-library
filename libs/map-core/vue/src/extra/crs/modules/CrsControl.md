---
category: Component
package: vue-map
---

# Crs Control

<FunctionInfo :frontmatter="$frontmatter" fn="CrsControl" />

## Props

Shared map control layout props (`position`, `order`, `controlLayout`, …). See [core module props](/map/core/module/props).

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { Map, CrsControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <CrsControl />
  </Map>
</template>
```
