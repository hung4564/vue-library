# UniversalRegistry — components

Register Vue / React components for layer menus, legends, and other UI resolved by `RegistryItem` / `componentKey`.

Methods, menu handlers, and control handles live on `UniversalRegistry` in `@hungpvq/map-core`. The Vue / React class **extends** that host and only adds component APIs — `getMethod` / `getMenuHandler` / `getControl` are the same resolve path (map-scoped first, then global).

```ts
import { UniversalRegistry } from '@hungpvq/vue-map-core';
// or `@hungpvq/react-map-core`
```

## Global vs per-map

| API | Scope | Use when |
| --- | --- | --- |
| `registerComponent(key, Comp)` | All maps | Defaults from plugins (`createDatasetRegistryPlugin`), app-wide overrides |
| `registerComponentForMap(mapId, key, Comp)` | One `mapId` | Page / demo overrides that must win over global (and not leak to other maps) |

Lookup order in `getComponent(key, mapId)`: **map-specific first**, then global.

```ts
// Global (plugin / bootstrap)
UniversalRegistry.registerComponent('layer-action-toggle-show', ToggleShow);

// Per map — overrides global for that map only
UniversalRegistry.registerComponentForMap(
  mapId,
  'layer-action-toggle-show-button',
  SampleToggleShowButton,
);
```

## Register after map load

Map-scoped entries live in the map store. When the map unmounts, `removeMap()` clears that store (React StrictMode remounts the map once in development).

**Prefer registering in `onMapLoaded` / `@map-loaded`**, so entries are written after each mount:

```ts
function onMapLoaded(map: MapSimple) {
  UniversalRegistry.registerComponentForMap(
    map.id,
    'demo-layer-toggle-show',
    SampleLayerToggleShow,
  );
  // load datasets…
}
```

Registering only during the parent’s first render can disappear after StrictMode remount if the parent does not re-run that code.

`registerComponent` (global) is not cleared by `removeMap`.

## Related

- Layer menus / `componentKey`: [Menus](/map/dataset/create-dataset/with-helper-menu)
- Map control handles: [UniversalRegistry controls](./registry-controls.md)
