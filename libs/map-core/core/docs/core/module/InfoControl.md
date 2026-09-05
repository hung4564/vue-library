# InfoControl

Map view inspector: center, zoom, pitch, bearing, projection, and bounds. Click the toolbar button to open the panel.

## Usecase

- Read the current map camera and copy values for debugging or sharing.
- Capture a PNG screenshot of the current view (camera icon).

## Props

<!--@include: ./props.md-->

and

| Prop       | Description              | Type     | Required | Default Value |
| ---------- | ------------------------ | -------- | -------- | ------------- |
| `show`     | Open the panel initially | `boolean` | `false` | `false`       |
| `fileName` | Screenshot file name     | `string`  | `false` | `'map'`       |

## Events

None. Copy uses the clipboard. Screenshot downloads a PNG.

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map, InfoControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <InfoControl position="top-right" />
  </Map>
</template>
```

### React

```tsx
import { Map, InfoControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <InfoControl position="top-right" />
</Map>
```
