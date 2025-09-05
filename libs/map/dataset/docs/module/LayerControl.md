# Layer Control

## Usecase

- Provide a comprehensive layer management interface for datasets and layers.
- Allow users to create, group, reorder, and delete layers dynamically.
- Support drag-and-drop functionality for layer organization.
- Integrate with dataset management system for seamless layer operations.

## Props

<!--@include: ../../core/module/props.md-->

and

| Prop                  | Description                 | Type      | Required | Default Value |
| --------------------- | --------------------------- | --------- | -------- | ------------- |
| `disabledCreate`      | Disable create layer button | `boolean` | `false`  | `false`       |
| `disabledCreateGroup` | Disable create group button | `boolean` | `false`  | `false`       |
| `disabledDeleteAll`   | Disable delete all button   | `boolean` | `false`  | `false`       |

## Slots

| Name        | Description                   | Props               |
| ----------- | ----------------------------- | ------------------- |
| `titleList` | Custom content for title area | `{ mapId: string }` |
| `endList`   | Content at the end of list    | `{ mapId: string }` |
| `default`   | Default slot content          | -                   |

## Events

This component does not emit custom events. It integrates with the dataset management system through the store.

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
</script>

<template>
  <Map>
    <LayerControl position="top-left" :disabledCreate="false" :disabledCreateGroup="false" :disabledDeleteAll="false" />
  </Map>
</template>
```

### With Custom Slots

```vue
<template>
  <Map>
    <LayerControl position="top-left">
      <template #titleList="{ mapId }">
        <button @click="addCustomLayer">Add Custom Layer</button>
      </template>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
  </Map>
</template>
```

### With Basemap Integration

```vue
<template>
  <Map>
    <LayerControl position="top-left">
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerControl>
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerControl } from '@hungpvq/vue-map-dataset';
import { BaseMapCard } from '@hungpvq/vue-map-basemap';
</script>
```
