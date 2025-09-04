# SettingControl

## Usecase

- Provide a quick settings panel for toggling map options (labels, 3D, style).
- Group advanced controls inside a single menu to reduce UI clutter.

## Props

<!--@include: ./props.md-->

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
