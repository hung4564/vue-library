# Draw protocol

Shared types, services, and **`MapDraw`** (re-export of `@mapbox/mapbox-gl-draw`) live in **`@hungpvq/map-draw`**.

Adapters (`@hungpvq/vue-map-draw` / `@hungpvq/react-map-draw`) export **UI/hooks/locales only**. Import protocol, types, and helpers from `@hungpvq/map-draw` — adapters do **not** re-export core.

## Packages

| Package | Role |
| --- | --- |
| `@hungpvq/map-draw` | `MapDraw`, `DrawService`, `DrawingType`, `StaticMode`, `getDrawStyles`, id helpers, inspect helpers |
| `@hungpvq/vue-map-draw` | `DrawControl`, `InspectControl`, `useMapDraw`, locales, CSS |
| `@hungpvq/react-map-draw` | Same public control names; shared InspectController (style + popup/hover) |

## `MapDraw` (editing)

Mounting draw almost always needs **`StaticMode`** + **`getDrawStyles`** (Stable):

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

## Stable feature ids

For result GeoJSON layers (select / update / delete):

1. After add, `DrawService` sets `properties.id = feature.id`.
2. Use `promoteId: 'id'` on the GeoJSON source so `queryRenderedFeatures` exposes ids.
3. Prefer helpers from `@hungpvq/map-draw`:
   - `getFeatureId(feature)` — `feature.id` else `properties.id`
   - `sameFeature(a, b)` — string-normalized id equality

```ts
import { getFeatureId, sameFeature } from '@hungpvq/map-draw';

collection.features = collection.features.filter((f) => !sameFeature(f, hit));
```

## Control ids

| Id | Purpose |
| --- | --- |
| `mapDrawDraftList` | Draft feature list panel when draft mode is on |
| `mapInspectControl` | Inspect button (Vue + React; shared `InspectController`) |

Keep these ids identical across Vue and React.

## Events / service

- `MAP_DRAW_EVENT` — mitt keys for draw **session** lifecycle (`start` / `end`).
- `DrawService` — save collection + feature bookkeeping (framework-agnostic).
  - Selecting an existing feature for edit marks **`updated`** (not `added`), even if Mapbox fires `draw.create`.

## DrawingType

Use `DrawingType` / `DrawingTypeName` / `DRAW_MODES` from **`@hungpvq/map-draw`** for `drawSupports` and `changeMode`.
