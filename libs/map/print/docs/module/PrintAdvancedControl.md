# PrintAdvancedControl

## Usecase

- Configure printable area and guides for high-quality exports.
- Prepare maps for PDF layouts with fixed sizes and aspect ratios.

## Props

<!--@include: ../../core/module/props.md-->

and

| Prop                    | Description                        | Type      | Required | Default Value |
| ----------------------- | ---------------------------------- | --------- | -------- | ------------- |
| `disabledCrosshair`     | Disable the crosshair overlay      | `boolean` | false    | `false`       |
| `disabledPrintableArea` | Disable the printable area overlay | `boolean` | false    | `false`       |
| `fileName`              | The name of the exported file      | `string`  | false    | `map`         |

## Slots

| Name      | Description             |
| --------- | ----------------------- |
| `default` | Slot for custom content |

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { PrintAdvancedControl } from '@hungpvq/vue-map-print';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-print/style.css';
</script>

<template>
  <Map>
    <PrintAdvancedControl fileName="custom-map" />
  </Map>
</template>
```
