# Compare BaseMap Control

## Usecase

- Compare two base maps using a swipe/side-by-side interaction.
- Useful for visual QA or demonstrating style differences.

## Props

<!--@include: ../../core/module/props.md-->

and

| Prop             | Description   | Type     | Required | Default Value     |
| ---------------- | ------------- | -------- | -------- | ----------------- |
| `title`          |               | `string` | `fasle`  | ``                |
| `defaultBaseMap` |               | `string` | `fasle`  | `Open Street Map` |
| `controlIcon`    |               | `string` | `fasle`  | ``                |
| `baseMaps`       | BaseMapItem[] | `array`  | `fasle`  | ``                |

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Events

| Event            | Payload   | Description                |
| ---------------- | --------- | -------------------------- |
| `basemap-change` | `Basemap` | Fired when basemap changes |

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { CompareBaseMapControl } from '@hungpvq/vue-map-basemap';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-basemap/style.css';
const baseMaps = [];
</script>

<template>
  <Map>
    <CompareBaseMapControl :baseMaps="baseMaps" />
  </Map>
</template>
```
