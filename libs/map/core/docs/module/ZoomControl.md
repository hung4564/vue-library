# ZoomControl

## Props

<!--@include: ./props.md-->

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
import { Map, ZoomControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <ZoomControl />
  </Map>
</template>
```
