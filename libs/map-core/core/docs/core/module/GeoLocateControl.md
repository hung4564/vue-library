# GeoLocateControl

## Usecase

- Center the map to the user location on mobile devices.
- Provide a locate-me button for field survey or navigation workflows.

## Props

<!--@include: ./props.md-->

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map, GeoLocateControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <GeoLocateControl />
  </Map>
</template>
```

### React

```tsx
import { Map, GeoLocateControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <GeoLocateControl />
</Map>
```
