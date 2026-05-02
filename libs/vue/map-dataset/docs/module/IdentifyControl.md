# Identify Control

## Usecase

- Provide interactive feature identification tools for map layers.
- Support both point click and bounding box selection for feature identification.
- Display identified features with their properties and available actions.
- Integrate with dataset management system for comprehensive feature analysis.

## Props

<!--@include: ../../core/module/props.md-->

and

| Prop          | Description                              | Type      | Required | Default Value |
| ------------- | ---------------------------------------- | --------- | -------- | ------------- |
| `immediately` | Start identify mode immediately on mount | `boolean` | `false`  | `false`       |

## Slots

This component does not expose custom slots.

## Events

This component does not emit custom events. It integrates with the dataset management system through the store.

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { IdentifyControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
</script>

<template>
  <Map>
    <IdentifyControl position="top-right" />
  </Map>
</template>
```

### Immediate Identify Mode

```vue
<template>
  <Map>
    <IdentifyControl position="top-right" :immediately="true" />
  </Map>
</template>
```

### With Dataset Integration

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <IdentifyControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { IdentifyControl, useMapDataset, createDataset } from '@hungpvq/vue-map-dataset';

function onMapLoaded(map: any) {
  const { addDataset } = useMapDataset(map.id);

  // Add datasets with identify capabilities
  const dataset = createDataset('Sample Dataset', null, true);
  addDataset(dataset);
}
</script>
```

## Features

- **Point Click Identification**: Click on the map to identify features at that location
- **Bounding Box Selection**: Draw a rectangle to identify features within the area
- **Feature Actions**: Each identified feature can have custom menu actions
- **Loading States**: Visual feedback during feature identification
- **Coordinate Display**: Shows the coordinates of the clicked point
- **Multi-layer Support**: Identifies features across multiple layers simultaneously
