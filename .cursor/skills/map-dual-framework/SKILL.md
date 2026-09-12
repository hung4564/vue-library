---
name: map-dual-framework
description: >-
  Guides Vue and React map adapter parity on top of framework-agnostic
  @hungpvq/map-core and map-dataset. Use when adding or changing map controls,
  hooks, registry plugins, dataset UI, or when mirroring a feature across Vue
  and React.
---

# Map Dual Framework (Vue + React)

## Layering

```
libs/map-core/core          → engine, store, theme, UniversalRegistry (host)
libs/map-core/map-dataset   → datasets, menus, identify, style protocol, GIS worker
libs/map-core/map-draw      → DrawService, DrawingType, styles, inspect helpers
libs/vue|react/map-core     → Map shell, controls, hooks; extend registry with components
libs/vue|react/map-dataset  → dataset UI + createDatasetRegistryPlugin() only
libs/vue|react/map-draw     → DrawControl / InspectControl (shared InspectController)
```

**Import rule:** adapters must **not** re-export core. Apps import builders/types/services from `@hungpvq/map-core` / `@hungpvq/map-dataset` / `@hungpvq/map-draw`, and UI/hooks from `@hungpvq/vue-*` or `@hungpvq/react-*`.

Never reintroduce adapter `builder/` / `model/` / `services/` barrels that only re-export `@hungpvq/map-dataset` (or core). Domain protocol stays on `@hungpvq/map-dataset/<domain>`; adapter `extra/` is framework menu-action UI only.

Prefer importing `UniversalRegistry` / `runMapControlAction` from `@hungpvq/map-core` in framework-agnostic code.

## Parity workflow

When adding a dual feature:

1. Implement protocol / logic in `map-core` or `map-dataset` if framework-agnostic.
2. Add Vue control/hook/UI under `libs/vue/...`.
3. Mirror React under `libs/react/...` with the same control **ids**, action **types**, and public hook names where Stable.
4. Register via existing patterns (`useRegisterMapControl`, dataset registry plugin).
5. Update docs for both demos if user-facing.
6. Check SemVer (`map-semver-api`) — new control id is usually **minor**; rename is **major**.

Skip React only when the area is explicitly Vue-richer (e.g. full Inspect popup) or the user scopes to one framework.

## Draw checklist

- Docs SoT: `libs/map-core/map-draw/docs` → `/map/draw/` (protocol + DrawControl; **Inspect documented under draw**, not a separate page).
- Control ids (must match Vue ↔ React): `mapDrawDraftList`, `mapInspectControl`.
- Stable shell: `DrawControl`, `InspectControl`, `useMapDraw`, `isDraftOption`, `DrawingType`, `MAP_DRAW_EVENT`, locales, CSS `./style.css`.
- React Inspect uses the same `InspectController` as Vue (style + popup).
- Demo route: Vue/React `/#/draw` only (no separate inspect demo page).
- Peers: `@hungpvq/map-draw`, `@mapbox/mapbox-gl-draw`, `maplibre-gl`.

## Registry conventions

- **Host:** `UniversalRegistry` in map-core (methods, menu handlers, control handles).
- **Adapters:** vue/react `map-core` extend the class and add `registerComponent` / `getComponent`.
- Dataset UI must keep `createDatasetRegistryPlugin()` (or equivalent) so menus/components resolve.
- Do not rename documented control ids or menu component keys without a major bump.
- **Component overrides (dataset UI, attribute-table parts, menu action UI, …):** prefer `UniversalRegistry.registerComponent` / `registerComponentForMap` + stable keys (`ATTRIBUTE_TABLE_COMPONENT_KEY`, `LIST_VIEW_MENU_COMPONENT_KEY`, …) and `RegistryItem`. Props are for data / toggles (`ui`, `columns`, `store`, …). Do **not** add a parallel “pass components via props” API unless the feature has no registry key yet.

## Buttons: always `MapControlButton`

In **all** map library UI (`libs/vue/map-*`, `libs/react/map-*`, including dataset, draw, devtools, controls, toolbars, pagers, menus chrome):

- **Always** use Stable root `MapControlButton` from `@hungpvq/vue-map-core` / `@hungpvq/react-map-core`.
- Do **not** use raw `<button>`, `BaseButton`, ad-hoc button classes, or Experimental `./fields` button primitives for map chrome actions.
- Prefer `variant` (`icon` \| `plain` \| `text` \| `tonal` \| `outlined` \| `filled`) + `size` (`small` \| `medium` \| `large` \| px). Dense rows (attribute table, layer list): usually `size="small"`.
- Variant/size SoT lives in `@hungpvq/map-core` `ui/map-button` (locked via dual parity tests).

App/demos that mirror library UI should follow the same rule when building map chrome.

## Naming / structure cues

- Vue: SFC under `modules/`, Composition API hooks
- React: TSX under matching module folders; hooks like `useMap`, `useMapInstance`, `useRegisterMapControl`
- Shared styles: package `style.css` entries and documented CSS variables — change carefully

## React Vite demos

Path aliases resolve `@hungpvq/react-*` into `libs/`. Exclude `libs/` from Fast Refresh or named exports break in the browser:

```ts
react({ exclude: [/node_modules/, /[\\/]libs[\\/]/] });
```

Same rule as draggable demos (`draggable-semver-api`, `vue-library-overview`).

## Map `buttonInMobile` (≤640px)

`Map` prop `buttonInMobile`: `'button' | 'toolbar' | 'menu'` (default `'button'`). Resolved via `resolveControlLayout` → `ResolvedControlLayout` (`standalone` | `toolbar` | `menu`).

| Value | Behavior |
|-------|----------|
| `button` | Corner `#btn` unchanged |
| `toolbar` | Promote controls into one `ToolbarControl` host (except `controlLayout="button"`) |
| `menu` | Hide per-control corner `#btn`; fan out clusters by `position` into corner stacks; outside-in More. Overflow/budget helpers live in `@hungpvq/map-core/toolbar`. |


Rules:

- Do **not** put overflow/More logic inside `MapControlGroupButton` for `menu` — overflow is per-corner in `ToolbarControl`.
- `controlLayout="button"` never auto-promotes (stays standalone). Use it for status chrome (e.g. `MouseCoordinatesControl`).
- Mount a single `<ToolbarControl />` for both `toolbar` and `menu`. Menu uses `ModuleContainer` `#btn` + `#btnOutside`.
- Demo: `/#/mobile-menu`; opt-in toolbar: `/#/toolbar`.
- Mirror Vue + React; shared helpers in `@hungpvq/map-core` / `@hungpvq/map-core/toolbar`.

## Checklist before finishing

- [ ] Core logic not duplicated only in one framework package
- [ ] Control ids / actions match across Vue and React (if dual)
- [ ] Dataset plugin / registry wiring still registers components
- [ ] Types exported consistently from package entry
- [ ] Demo or docs smoke path noted if UI-visible
- [ ] New React Vite apps that alias `libs/` exclude Fast Refresh on `libs/`
- [ ] Experimental field names on `./fields`: prefer `BaseCollapse` / `InputTextArea` (aliases `Collapse` / `InputTextarea`)
- [ ] Every new/changed map UI button uses `MapControlButton` (never raw `<button>` / removed `BaseButton`)
- [ ] Run `nx test @hungpvq/map-core -- vue-react-parity.spec.ts` when adding dual controls or shared exports

**Automated lock:** `libs/map-core/core/src/dual/parity-catalog.ts` + `vue-react-parity.spec.ts` (control ids + shared Stable root + shared `/fields` Experimental allowlists + `MapControlButton` `variant`/`size` SoT in `@hungpvq/map-core` `ui/map-button`).
