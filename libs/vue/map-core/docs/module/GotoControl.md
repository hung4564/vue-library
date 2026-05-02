# GotoControl

## Usecase

- Jump to specific coordinates or saved places via UI.
- Enable quick navigation between bookmarks in analytic dashboards.

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
import { Map, GotoControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <GotoControl />
  </Map>
</template>
```
