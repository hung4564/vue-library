# `@hungpvq/vue-map-draw`

Vue adapter for map draw / inspect on MapLibre.

## Install

```bash
npm install @hungpvq/vue-map-draw @hungpvq/map-draw
```

```ts
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-draw/style.css';
```

## Usage

Prefer `useMapDraw(mapId).start(config)` with **`MapDrawOption`** from `@hungpvq/map-draw` (CRUD + `drawSupports` + optional `callback`). Adapters do not re-export core protocol.

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

const { start } = useMapDraw('demo');

function onMapLoaded(_map: MapSimple) {
  start({
    drawSupports: [DrawingType.POINT, DrawingType.LINE_STRING, DrawingType.POLYGON],
    cleanAfterDone: true,
    addFeature: async () => undefined,
    updateFeature: async () => undefined,
    deleteFeature: async () => undefined,
    selectFeature: async () => undefined,
    redraw: () => undefined,
  } satisfies MapDrawOption);
}
</script>
```

Inspect (`InspectControl`, id `mapInspectControl`) is part of this package — see docs [Inspect section](/map/draw/#inspect).

## Docs

- Hub: `/map/draw/` (source of truth: `libs/map-core/map-draw/docs`)
- Protocol: `/map/draw/protocol`
- Demo: `apps/vue/demo-map` → `/#/draw`

## License

MIT
