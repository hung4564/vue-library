# `@hungpvq/map-draw`

Draw session protocol (`DrawService`, `MapDrawOption`), styles, id helpers, inspect helpers, and a re-export of **`@mapbox/mapbox-gl-draw`** as `MapDraw`.

- Docs: VitePress `/map/draw/` · source [`docs/`](./docs/)
- Vue UI: `@hungpvq/vue-map-draw` (UI/hooks only — import protocol from this package)
- React UI: `@hungpvq/react-map-draw` (Inspect thinner)

```bash
npm install @hungpvq/map-draw @mapbox/mapbox-gl-draw
```

Peers: `@mapbox/mapbox-gl-draw`, `maplibre-gl`, `@hungpvq/map-core` (optional `randomcolor` for inspect colors).

```ts
import {
  MapDraw,
  StaticMode,
  getDrawStyles,
  getFeatureId,
  sameFeature,
} from '@hungpvq/map-draw';

const draw = new MapDraw({
  displayControlsDefault: false,
  styles: getDrawStyles(),
  modes: { ...MapDraw.modes, static: StaticMode },
});
map.addControl(draw);
draw.changeMode('draw_polygon');
```

**Stable mount pieces:** `MapDraw`, `StaticMode`, `getDrawStyles`.  
**Stable ids:** `getFeatureId` / `sameFeature` (+ `promoteId: 'id'` on result sources). See [protocol](./docs/protocol.md).
