# DrawControl

Toolbar that mounts `@mapbox/mapbox-gl-draw` (`MapDraw`) on the map and drives save/edit via `MapDrawOption` / `useMapDraw().start()`.

## Usecase

- Sketch points, lines, or polygons for annotation or data entry.
- Persist geometry through CRUD hooks on `MapDrawOption`.

## Props

Shared map control layout props (position, visibility, order) match other map controls.

| Prop | Description | Type | Required | Default |
| --- | --- | --- | --- | --- |
| `drawOptions` | Optional initial / bound draw session config | `MapDrawOption` | false | `undefined` |

Prefer starting a session with `useMapDraw(mapId).start(config)` so CRUD and `drawSupports` stay in sync. See [protocol](../protocol.md).

## Usage Notes

- Place inside `<Map>` from `@hungpvq/vue-map-core` or `@hungpvq/react-map-core`.
- Import package `style.css`.
- Draft list registers as control id `mapDrawDraftList` when draft mode is enabled.

## Vue

```vue
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { DrawingType, type MapDrawOption } from '@hungpvq/map-draw';
import { Map } from '@hungpvq/vue-map-core';
import { DrawControl, useMapDraw } from '@hungpvq/vue-map-draw';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-draw/style.css';

const { start } = useMapDraw('demo');

function onMapLoaded(_map: MapSimple) {
  start({
    drawSupports: [DrawingType.POINT, DrawingType.LINE_STRING],
    cleanAfterDone: true,
    addFeature: async () => undefined,
    updateFeature: async () => undefined,
    deleteFeature: async () => undefined,
    selectFeature: async () => undefined,
    redraw: () => undefined,
  } satisfies MapDrawOption);
}
</script>

<template>
  <Map map-id="demo" @map-loaded="onMapLoaded">
    <DrawControl position="top-right" />
  </Map>
</template>
```

## React

```tsx
import type { MapSimple } from '@hungpvq/map-core';
import { DrawingType, type MapDrawOption } from '@hungpvq/map-draw';
import { Map } from '@hungpvq/react-map-core';
import { DrawControl, useMapDraw } from '@hungpvq/react-map-draw';
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-draw/style.css';

export function Example() {
  const { start } = useMapDraw('demo');

  function onMapLoaded(_map: MapSimple) {
    const config: MapDrawOption = {
      drawSupports: [DrawingType.POINT, DrawingType.LINE_STRING],
      cleanAfterDone: true,
      addFeature: async () => undefined,
      updateFeature: async () => undefined,
      deleteFeature: async () => undefined,
      selectFeature: async () => undefined,
      redraw: () => undefined,
    };
    start(config);
  }

  return (
    <Map mapId="demo" onMapLoaded={onMapLoaded}>
      <DrawControl position="top-right" />
    </Map>
  );
}
```

## Inspect (same package)

Export `InspectControl` from vue/react-map-draw with control id **`mapInspectControl`**. Vue includes popup/hover inspect UX; React ships a thin style-toggle shell. See hub [Inspect](../index.md#inspect).
