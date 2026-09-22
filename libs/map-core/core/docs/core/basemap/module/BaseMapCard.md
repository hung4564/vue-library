# BaseMap Card

## Usecase

- Display selectable base map previews inside a settings panel.
- Provide a visual picker when multiple styles are available.

## Props

| Prop              | Description | Type      | Required | Default Value |
| ----------------- | ----------- | --------- | -------- | ------------- |
| `mapId`           | Map identifier | `string` | yes      | —             |
| `title`           |             | `string`  | `false`  | ``            |
| `showOpacity`     | Show opacity slider | `boolean` | `false` | `false` |
| `allowAddBasemap` | Show **Add basemap**; removable (custom) current items show × on the thumbnail | `boolean` | `false` | `false` |

## Events

| Event            | Payload   | Description                    |
| ---------------- | --------- | ------------------------------ |
| `basemap-select` | `Basemap` | Fired when basemap is selected |

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl, BaseMapCard } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
const baseMaps = [];
</script>

<template>
  <Map>
    <BaseMapControl :baseMaps="baseMaps" />
    <BaseMapCard show-opacity allow-add-basemap />
  </Map>
</template>
```

### React

```tsx
import { Map, BaseMapControl, BaseMapCard } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

const baseMaps = [];

<Map>
  <BaseMapControl baseMaps={baseMaps} />
  <BaseMapCard mapId="map" showOpacity allowAddBasemap />
</Map>
```
