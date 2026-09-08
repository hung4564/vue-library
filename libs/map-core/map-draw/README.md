# `@hungpvq/map-draw`

Draw session protocol (`DrawService`, `MapDrawOption`), styles, inspect helpers, and a re-export of **`@mapbox/mapbox-gl-draw`** as `MapDraw`.

- Docs: [VitePress `/map/draw/`](https://hung4564.github.io/) · source [`docs/`](./docs/)
- Vue UI: `@hungpvq/vue-map-draw`
- React UI: `@hungpvq/react-map-draw` (Inspect thinner; documented under draw hub)

```bash
npm install @hungpvq/map-draw @mapbox/mapbox-gl-draw
```

Peers: `@mapbox/mapbox-gl-draw`, `maplibre-gl`, `@hungpvq/map-core` (optional `randomcolor` for inspect colors).

```ts
import { MapDraw, StaticMode, getDrawStyles } from '@hungpvq/map-draw';

const draw = new MapDraw({
  displayControlsDefault: false,
  styles: getDrawStyles(),
  modes: { ...MapDraw.modes, static: StaticMode },
});
map.addControl(draw);
draw.changeMode('draw_polygon');
```
