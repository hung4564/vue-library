# Identify Show First Control

## Usecase

- Automatically identify and show the first available feature when clicking on the map.
- Provide immediate feature identification without requiring user interaction with a control panel.
- Streamline the identify workflow for quick feature inspection.
- Integrate seamlessly with dataset management system for automatic feature detection.

## Props

<!--@include: ../../core/module/props.md-->

## Slots

This component does not expose custom slots.

## Events

This component does not emit custom events. It automatically handles feature identification and displays results.

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { IdentifyShowFirstControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
</script>

<template>
  <Map>
    <IdentifyShowFirstControl />
  </Map>
</template>
```

### With Dataset Integration

```vue
<template>
  <Map @map-loaded="onMapLoaded">
    <IdentifyShowFirstControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { IdentifyShowFirstControl, useMapDataset, createDataset } from '@hungpvq/vue-map-dataset';

function onMapLoaded(map: any) {
  const { addDataset } = useMapDataset(map.id);

  // Add datasets with identify capabilities
  const dataset = createDataset('Sample Dataset', null, true);
  addDataset(dataset);
}
</script>
```

### Combined with Identify Control

```vue
<template>
  <Map>
    <IdentifyControl position="top-right" />
    <IdentifyShowFirstControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { IdentifyControl, IdentifyShowFirstControl } from '@hungpvq/vue-map-dataset';
</script>
```

## Features

- **Automatic Identification**: Automatically identifies features on map click
- **First Feature Display**: Shows the first available feature from identified results
- **Menu Action Integration**: Automatically triggers the 'show-detail' menu action if available
- **Silent Operation**: Works in the background without visible UI elements
- **Multi-layer Support**: Identifies features across multiple layers simultaneously
- **Immediate Response**: Provides instant feedback on feature identification

## Notes

- This component is invisible and works automatically in the background
- It requires datasets with identify capabilities to function properly
- The component will automatically trigger menu actions for identified features
- Best used in combination with other identify controls for comprehensive feature analysis
