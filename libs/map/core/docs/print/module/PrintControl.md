# PrintControl

## Usecase

- Export current map view for reporting or sharing.
- Provide one-click print/export in admin dashboards.

## Props

<!--@include: ../../module/props.md-->

and

| Prop       | Description                   | Type     | Required | Default Value |
| ---------- | ----------------------------- | -------- | -------- | ------------- |
| `fileName` | The name of the exported file | `string` | false    | `map`         |

## Slots

| Name      | Description             |
| --------- | ----------------------- |
| `default` | Slot for custom content |

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { PrintControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <PrintControl fileName="custom-map" />
  </Map>
</template>
```
