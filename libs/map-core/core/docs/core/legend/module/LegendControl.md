# MapLegend Control

## Usecase

- Display dynamic legend based on visible layers and symbology.
- Provide contextual guidance for map colors, lines, and symbols.

## Props

<!--@include: ../../core/module/props.md-->

## Slots

| Name      | Description                |
| --------- | -------------------------- |
| `default` | Custom legend content slot |

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <LegendControl />
  </Map>
</template>
```

### React

```tsx
import { Map, LegendControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <LegendControl />
</Map>
```
