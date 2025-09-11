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

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LegendControl } from '@hungpvq/vue-map-legend';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-legend/style.css';
</script>

<template>
  <Map>
    <LegendControl />
  </Map>
</template>
```
