# ZoomControl

## Usecase

- Add basic zoom and compass for kiosks or read-only maps.
- Offer compact navigation when the default MapLibre controls are hidden.

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

### Vue

```vue
<script setup lang="ts">
import { Map, ZoomControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <ZoomControl />
  </Map>
</template>
```

### React

```tsx
import { Map, ZoomControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <ZoomControl />
</Map>
```
