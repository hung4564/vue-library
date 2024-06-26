---
category: Component
package: vue-map
---

# Home Control

<FunctionInfo :frontmatter="$frontmatter" fn="HomeControl" />

## Props

<!--@include: ../ModuleContainer/props.md-->

and

| Prop     | Description | Type              | Required | Default Value |
| -------- | ----------- | ----------------- | -------- | ------------- |
| `zoom`   |             | `number`          | `fasle`  | -             |
| `center` |             | `[number,number]` | `fasle`  | -             |

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { Map, HomeControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <HomeControl />
  </Map>
</template>
```
