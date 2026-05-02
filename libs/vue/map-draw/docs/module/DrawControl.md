# DrawControl

## Usecase

- Let users sketch points/lines/polygons for feedback or annotation.
- Collect geometry inputs for further analysis or data submission.

## Props

<!--@include: ../../core/module/props.md-->

and

| Prop          | Description                 | Type         | Required | Default Value |
| ------------- | --------------------------- | ------------ | -------- | ------------- |
| `drawOptions` | Drawing options (see below) | `DrawOption` | false    | `undefined`   |

## Slots

| Name      | Description         |
| --------- | ------------------- |
| `default` | Custom content slot |

## Usage Notes

- Use inside a `<Map>` component from `@hungpvq/vue-map-core`.
- Provide a `drawOptions` prop to configure supported geometry types and save behavior.
- Emits events for all major draw actions (start, complete, update, delete).
- Supports slot for custom button or UI extension.

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { DrawControl } from '@hungpvq/vue-map-draw';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-draw/style.css';
</script>

<template>
  <Map>
    <DrawControl />
  </Map>
</template>
```
