# Draw protocol

Shared types, services, and **`MapDraw`** (re-export of `@mapbox/mapbox-gl-draw`) live in `@hungpvq/map-draw`. UI adapters re-export Stable symbols and add framework store/hooks.

## Packages

| Package | Role |
| --- | --- |
| `@hungpvq/map-draw` | `MapDraw` (`@mapbox/mapbox-gl-draw`), `DrawService`, `DrawingType`, theme, inspect helpers |
| `@hungpvq/vue-map-draw` | `DrawControl`, `InspectControl`, `useMapDraw`, locales, CSS |
| `@hungpvq/react-map-draw` | Same public control names; Inspect thinner |

## `MapDraw` (editing)

```ts
import { MapDraw, StaticMode, getDrawStyles } from '@hungpvq/map-draw';

const draw = new MapDraw({
  displayControlsDefault: false,
  styles: getDrawStyles(),
  modes: { ...MapDraw.modes, static: StaticMode },
});
map.addControl(draw);

draw.changeMode('draw_polygon'); // or DrawingType.POLYGON
draw.getAll();
```

Modes: `static` (custom), `simple_select`, `direct_select`, `draw_point`, `draw_line_string`, `draw_polygon`.

Map events: `draw.create` / `draw.update` / `draw.delete` (+ `draw.selectionchange` / `draw.modechange`).

## `MapDrawOption` (app session)

Session config passed to `useMapDraw(mapId).start(config)` (and optionally Vue `drawOptions` prop):

- `drawSupports`: `DrawingType[]` (point / line / polygon)
- CRUD: `addFeature`, `updateFeature`, `deleteFeature`, `selectFeature`, `redraw`
- Optional `callback` after save
- Optional draft block (`draft.show`, …) → draft list control id `mapDrawDraftList`
- Optional colors: `primaryColor`, `activeColor`
- `cleanAfterDone`

Type name is **`MapDrawOption`** (not `DrawOption`). Engine options use **`MapDrawOptions`** (`MapboxDrawOptions`).

## Control ids

| Id | Purpose |
| --- | --- |
| `mapDrawDraftList` | Draft feature list panel when draft mode is on |
| `mapInspectControl` | Inspect button (Vue rich / React thin) |

Keep these ids identical across Vue and React.

## Events / service

- `MAP_DRAW_EVENT` — mitt keys for draw **session** lifecycle (`start` / `end`).
- `DrawService` — save collection + feature bookkeeping (framework-agnostic).

## DrawingType

Use `DrawingType` / `DrawingTypeName` / `DRAW_MODES` from `@hungpvq/map-draw` (or adapter re-exports) for `drawSupports` and `changeMode`.
