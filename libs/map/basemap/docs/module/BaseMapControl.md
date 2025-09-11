# BaseMap Control

## Usecase

- Allow end users to switch base layers (streets/satellite/dark) quickly.
- Preconfigure a curated list of base maps for consistency across apps.

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
import { BaseMapControl } from '@hungpvq/vue-map-basemap';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-basemap/style.css';
const baseMaps = [];
</script>

<template>
  <Map>
    <BaseMapControl :baseMaps="baseMaps" />
  </Map>
</template>
```
