# Map Draw

> Draw / edit: `@hungpvq/map-draw` (core) + `@hungpvq/vue-map-draw` / `@hungpvq/react-map-draw` (UI).

Demo: Vue `/#/draw` · React `/#/draw` (source in `apps/vue/demo-map` and `apps/react/demo-map`).

## Installation

### Core (optional direct use)

```bash
npm install @hungpvq/map-draw
```

### Vue

```bash
npm install @hungpvq/vue-map-draw @hungpvq/map-draw
```

```ts
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-draw/style.css';
```

### React

```bash
npm install @hungpvq/react-map-draw @hungpvq/map-draw
```

```ts
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-draw/style.css';
```

## Features

- Drawing tools — point, line, polygon (`DrawingType`)
- Edit / save via `MapDrawOption` CRUD + optional `callback`
- Draft list control id: `mapDrawDraftList`
- Shared `DrawService`, styles, static mode in `@hungpvq/map-draw`

## Vue — Basic Draw Control

```vue
<template>
  <Map map-id="demo" @map-loaded="onMapLoaded">
    <DrawControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { DrawingType, type MapDrawOption } from '@hungpvq/map-draw';
import { Map } from '@hungpvq/vue-map-core';
import { DrawControl, useMapDraw } from '@hungpvq/vue-map-draw';
import '@hungpvq/vue-map-draw/style.css';

const { start } = useMapDraw('demo');

function onMapLoaded(_map: MapSimple) {
  const config: MapDrawOption = {
    drawSupports: [DrawingType.POINT, DrawingType.LINE_STRING, DrawingType.POLYGON],
    cleanAfterDone: true,
    addFeature: async () => undefined,
    updateFeature: async () => undefined,
    deleteFeature: async () => undefined,
    selectFeature: async () => undefined,
    redraw: () => undefined,
    callback(result) {
      console.info('save', result);
    },
  };
  start(config);
}
</script>
```

## React — Basic Draw Control

```tsx
import type { MapSimple } from '@hungpvq/map-core';
import { DrawingType, type MapDrawOption } from '@hungpvq/map-draw';
import { Map } from '@hungpvq/react-map-core';
import { DrawControl, useMapDraw } from '@hungpvq/react-map-draw';
import '@hungpvq/react-map-draw/style.css';

export function DrawExample() {
  const { start } = useMapDraw('demo');

  function onMapLoaded(_map: MapSimple) {
    const config: MapDrawOption = {
      drawSupports: [
        DrawingType.POINT,
        DrawingType.LINE_STRING,
        DrawingType.POLYGON,
      ],
      cleanAfterDone: true,
      addFeature: async () => undefined,
      updateFeature: async () => undefined,
      deleteFeature: async () => undefined,
      selectFeature: async () => undefined,
      redraw: () => undefined,
      callback(result) {
        console.info('save', result);
      },
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

## Inspect {#inspect}

Inspect is part of the **draw** packages (same control id on Vue and React): `mapInspectControl`.

| | Vue `@hungpvq/vue-map-draw` | React `@hungpvq/react-map-draw` |
| --- | --- | --- |
| Export | `InspectControl` | `InspectControl` |
| Behavior | Shared `InspectController` (style + popup/hover) | Same |
| Helpers | `@hungpvq/map-draw` inspect helpers | Same |

Mount next to `DrawControl` when you need layer inspect; there is no separate demo route — use `/#/draw` and add `<InspectControl />` in your app if needed.

```vue
<template>
  <Map map-id="demo">
    <DrawControl position="top-right" />
    <InspectControl position="top-right" />
  </Map>
</template>
```

```tsx
<Map mapId="demo">
  <DrawControl position="top-right" />
  <InspectControl position="top-right" />
</Map>
```

## Notes

- Prefer `useMapDraw(mapId).start(config)` for sessions; optional `drawOptions` prop on Vue `DrawControl` is `MapDrawOption`.
- Type is **`MapDrawOption`**, not `DrawOption`.
- Import protocol/types/helpers from `@hungpvq/map-draw`; adapters do not re-export core.
- Result layers: `promoteId: 'id'` + `getFeatureId` / `sameFeature` for select/update/delete.
- Protocol details: [protocol](./protocol.md) · Component: [DrawControl](./module/DrawControl.md)
