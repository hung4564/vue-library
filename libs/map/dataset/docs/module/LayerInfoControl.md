# Layer Info Control

## Usecase

- Provide a read-only layer information display for datasets and layers.
- Show layer details without editing capabilities.
- Display layer hierarchy and properties in a clean interface.
- Integrate with basemap controls for comprehensive layer management.

## Props

<!--@include: ../../core/module/props.md-->

## Slots

| Name      | Description                | Props               |
| --------- | -------------------------- | ------------------- |
| `endList` | Content at the end of list | `{ mapId: string }` |
| `default` | Default slot content       | -                   |

## Events

This component does not emit custom events. It provides a read-only view of layer information.

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerInfoControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
</script>

<template>
  <Map>
    <LayerInfoControl position="bottom-right" />
  </Map>
</template>
```

### With Basemap Integration

```vue
<template>
  <Map>
    <LayerInfoControl position="bottom-right">
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerInfoControl>
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { LayerInfoControl } from '@hungpvq/vue-map-dataset';
import { BaseMapCard } from '@hungpvq/vue-map-basemap';
</script>
```

### Read-only Layer Display

```vue
<template>
  <Map>
    <LayerInfoControl position="bottom-right" :show="true" />
  </Map>
</template>
```
