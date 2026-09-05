# MapContextMenuControl

Right-click the map to open a context menu: coordinates, copy GeoJSON, center / zoom, Quick analysis, Google Maps / Earth.

Uses `EventContextMenu` (same pattern as `EventClick`) through `useEventMap`. Needs `ActionControl` on the map (already mounted by `Map`).

## Usecase

- Inspect a clicked point (lat, lng).
- Copy a GeoJSON Point, center or zoom the map, open Google Maps / Earth.
- Turn items on/off, or add your own with `createMapMenuBuilder()` / `createMenuBuilder()`.

## Props

<!--@include: ./props.md-->

and

| Prop | Description | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `items` | Full menu (skips built-ins). Same shape as `createMenuBuilder().item().build()` | `MapContextMenuItem[]` | `false` | built-in list |
| `include` | Only these built-in ids | `MapContextMenuItemId[]` | `false` | all |
| `exclude` | Hide these built-in ids | `MapContextMenuItemId[]` | `false` | `[]` |
| `extra` | Appended items | `MapContextMenuItem[]` | `false` | `[]` |
| `prepend` | Prepended items | `MapContextMenuItem[]` | `false` | `[]` |
| `showCoords` | Show lat,lng header (click to copy) | `boolean` | `false` | `true` |
| `enabled` | Listen to right-click | `boolean` | `false` | `true` |
| `zoomDelta` | Zoom step for **Zoom in here** | `number` | `false` | `2` |

Built-in ids: `copy-geojson`, `center-here`, `zoom-in-here`, `quick-analysis`, `identify-here`, `add-geojson-here`, `copy-coords`, `copy-wkt`, `google-maps`, `google-earth`. Extra add-layer items use their own ids (default `buffer-500m`, `buffer-1000m`, `buffer-5000m`).

**Identify features** (under Quick analysis) is added only when [`IdentifyControl`](/map/dataset/module/IdentifyControl) is mounted. Clicking it runs the same query and opens that panel.

**Add GeoJSON here** items (under Quick analysis) are added only when [`LayerControl`](/map/dataset/module/LayerControl) is mounted: **Buffer 500 m here**, **Buffer 1 km here**, **Buffer 5 km here**. Exclude the group with `add-geojson-here`, or a single item with its id (`buffer-500m`).

## Events

| Name | Payload |
| --- | --- |
| Vue `open` / React `onOpen` | `MapContextMenuTarget` (`lngLat`, `point`, `mapId`) |
| Vue `close` / React `onClose` | — |
| Vue `select` / React `onSelect` | `{ item, target }` |

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map, MapContextMenuControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <MapContextMenuControl />
  </Map>
</template>
```

Hide some items, add one with `createMenuBuilder` (or `createMapMenuBuilder` / `createMapContextMenuBuilder`):

```ts
import {
  createMenuBuilder,
  createMapContextMenuBuilder,
  type MapContextMenuTarget,
} from '@hungpvq/map-dataset';
import { createMapMenuBuilder } from '@hungpvq/map-core';

const extra = createMenuBuilder<MapContextMenuTarget>()
  .item()
  .setLocation('menu')
  .setId('alert')
  .setName('Log point')
  .setClick(({ layer }) => {
    console.info(layer.lngLat);
  })
  .build();

const also = createMapContextMenuBuilder()
  .item()
  .setLocation('menu')
  .setName('Same as createMenuBuilder')
  .setClick(({ layer }) => console.info(layer.lngLat))
  .build();

const fromCore = createMapMenuBuilder()
  .item()
  .setName('Same API (core)')
  .setClick(({ layer }) => console.info(layer.lngLat))
  .build();
```

```vue
<MapContextMenuControl
  :exclude="['copy-geojson']"
  :extra="[extra, also, fromCore]"
/>
```

Without a menu UI, listen yourself:

```ts
import { EventContextMenu } from '@hungpvq/map-core';
import { useEventMap } from '@hungpvq/vue-map-core';

const { add, remove } = useEventMap(
  mapId,
  new EventContextMenu().setHandler((e) => {
    console.info(e.lngLat);
  }),
  true,
);
```

### React

```tsx
import { Map, MapContextMenuControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <MapContextMenuControl exclude={['copy-geojson']} />
</Map>
```
