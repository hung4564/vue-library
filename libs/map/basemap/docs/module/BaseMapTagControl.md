# BaseMap Tag Control

## Usecase

- Show clickable tags to toggle base maps inline with other controls.
- Use when space is limited and a compact switcher is preferred.

## Props

<!--@include: ../../core/module/props.md-->

and

| Prop             | Description   | Type     | Required | Default Value     |
| ---------------- | ------------- | -------- | -------- | ----------------- |
| `defaultBaseMap` |               | `string` | `fasle`  | `Open Street Map` |
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
import { BaseMapTagControl } from '@hungpvq/vue-map-basemap';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-basemap/style.css';
const baseMaps = [];
</script>

<template>
  <Map>
    <BaseMapTagControl :baseMaps="baseMaps" />
  </Map>
</template>
```
