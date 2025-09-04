# BaseMap Card

## Usecase

- Display selectable base map previews inside a settings panel.
- Provide a visual picker when multiple styles are available.

## Props

| Prop    | Description | Type     | Required       | Default Value |
| ------- | ----------- | -------- | -------------- | ------------- |
| `mapId` | `string`    | `''`     | Map identifier |
| `title` |             | `string` | `fasle`        | ``            |

## Events

| Event            | Payload   | Description                    |
| ---------------- | --------- | ------------------------------ |
| `basemap-select` | `Basemap` | Fired when basemap is selected |

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl, BaseMapCard } from '@hungpvq/vue-map-basemap';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-basemap/style.css';
const baseMaps = [];
</script>

<template>
  <Map>
    <BaseMapControl :baseMaps="baseMaps" />
    <BaseMapCard />
  </Map>
</template>
```
