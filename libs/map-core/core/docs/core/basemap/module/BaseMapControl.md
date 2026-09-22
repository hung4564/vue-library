# BaseMap Control

## Usecase

- Allow end users to switch base layers (streets/satellite/dark) quickly.
- Preconfigure a curated list of base maps for consistency across apps.

## Props

<!--@include: ../../module/props.md-->

and

| Prop             | Description   | Type     | Required | Default Value     |
| ---------------- | ------------- | -------- | -------- | ----------------- |
| `title`          |               | `string`  | `false` | ``                |
| `defaultBaseMap` |               | `string`  | `false` | `Open Street Map` |
| `controlIcon`    |               | `string`  | `false` | ``                |
| `baseMaps`       | BaseMapItem[] | `array`   | `false` | ``                |
| `showOpacity`    | Show opacity slider in the settings popup | `boolean` | `false` | `false` |
| `allowAddBasemap` | Show an **Add** tile in the basemap grid (opens URL form). Custom tiles show a remove control on the thumbnail. | `boolean` | `false` | `false` |

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Events

| Event            | Payload   | Description                |
| ---------------- | --------- | -------------------------- |
| `basemap-change` | `Basemap` | Fired when basemap changes |

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { BaseMapControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
const baseMaps = [];
</script>

<template>
  <Map>
    <BaseMapControl :baseMaps="baseMaps" />
  </Map>
</template>
```

### React

```tsx
import { Map, BaseMapControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

const baseMaps = [];

<Map>
  <BaseMapControl baseMaps={baseMaps} />
</Map>
```
