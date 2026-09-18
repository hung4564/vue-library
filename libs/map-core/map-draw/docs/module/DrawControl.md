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

## Lifecycle

- On unmount (Vue `onBeforeUnmount` / React effect cleanup), `DrawControl` calls `close()`: removes Mapbox Draw listeners/control and hides the toolbar.
- Domain store cleanup on `removeMap` ends an open draw session (`config` cleared + `MAP_DRAW_EVENT.END`) via `getStore` — do not call `useMapDrawStore` from inside the cleanup callback (circular inference).
- Shared draw modes / styles / create-mode effects live in `@hungpvq/map-draw` (`getDrawCreateModeEffects`, `getDrawStyles`, `isDraftOption`).

### Thin host / `createDrawSession`

Vue and React `useDrawEvents` wrap Experimental **`createDrawSession`** (`@hungpvq/map-draw`):

| Host action | Session API |
| --- | --- |
| draw.create / update / delete + map-click select/delete | `getMapDrawHandlers` / `handleMapClick` / `selectMethod` / `startCreate` |
| Toolbar **Save** (before store persist) | `prepareSave()` — select mode + clear `isDraw` / current feature |
| Toolbar **Cancel** | `finishCancel(onCancel?)` — optional feature callback, select reset, then `redrawNonDraft()` once |
| Non-draft redraw after delete/cancel | `redrawNonDraft()` (no-op when option is draft) |

Hosts still own `save(...)` / draft list UI, and `cleanAfterDone` `deleteAll`. Prefer Experimental **`createMapDrawControl`** for MapDraw construct + mount instead of inlining `new MapDraw` in adapters.

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

Export `InspectControl` from vue/react-map-draw with control id **`mapInspectControl`**. Both use shared `InspectController` from `@hungpvq/map-draw` (style toggle + popup/hover). See hub [Inspect](../index.md#inspect).

## Accessibility

| Surface | Contract |
|---------|----------|
| Draw toolbar | `role="toolbar"` + `aria-label="Draw tools"` |
| Mode / action buttons | `MapControlButton` `title` → accessible name (Cancel, Save, Close, Draw, Select, Delete, draft actions) |
| Escape | When focus is inside the draw toolbar and a draw is in progress (`isDraw`), Escape emits cancel (same as Cancel) |

Document-level Escape for open panels remains on `bindMapKeyboardShortcuts` / the draggable shell; toolbar Escape only cancels an active draw when the toolbar chrome has focus.
