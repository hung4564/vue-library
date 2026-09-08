# `@hungpvq/react-map-draw`

React adapter for map draw / inspect on MapLibre.

```bash
npm install @hungpvq/react-map-draw @hungpvq/map-draw
```

```tsx
import type { MapSimple } from '@hungpvq/map-core';
import { DrawingType, type MapDrawOption } from '@hungpvq/map-draw';
import { Map } from '@hungpvq/react-map-core';
import { DrawControl, useMapDraw } from '@hungpvq/react-map-draw';
import '@hungpvq/react-map-draw/style.css';

export function Example() {
  const { start } = useMapDraw('my-map');

  function onMapLoaded(_map: MapSimple) {
    const config: MapDrawOption = {
      drawSupports: [DrawingType.POINT, DrawingType.LINE_STRING, DrawingType.POLYGON],
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
    <Map mapId="my-map" onMapLoaded={onMapLoaded}>
      <DrawControl position="top-right" />
    </Map>
  );
}
```

Shared protocol: `@hungpvq/map-draw` (adapters do not re-export core). Docs: `/map/draw/` (Inspect under the same hub). Demo: `apps/react/demo-map` → `/#/draw`.
