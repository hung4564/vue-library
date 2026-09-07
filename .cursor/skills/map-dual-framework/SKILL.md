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
libs/vue|react/map-core     → Map shell, controls, hooks; extend registry with components
libs/vue|react/map-dataset  → dataset UI + createDatasetRegistryPlugin(); re-export map-dataset
libs/vue/map-draw           → draw/edit (Vue only for now)
```

Prefer importing `UniversalRegistry` / `runMapControlAction` from `@hungpvq/map-core` in framework-agnostic code.

## Parity workflow

When adding a dual feature:

1. Implement protocol / logic in `map-core` or `map-dataset` if framework-agnostic.
2. Add Vue control/hook/UI under `libs/vue/...`.
3. Mirror React under `libs/react/...` with the same control **ids**, action **types**, and public hook names where Stable.
4. Register via existing patterns (`useRegisterMapControl`, dataset registry plugin).
5. Update docs for both demos if user-facing.
6. Check SemVer (`map-semver-api`) — new control id is usually **minor**; rename is **major**.

Skip React only when the area is explicitly Vue-only (e.g. `vue-map-draw`) or the user scopes to one framework.

## Registry conventions

- **Host:** `UniversalRegistry` in map-core (methods, menu handlers, control handles).
- **Adapters:** vue/react `map-core` extend the class and add `registerComponent` / `getComponent`.
- Dataset UI must keep `createDatasetRegistryPlugin()` (or equivalent) so menus/components resolve.
- Do not rename documented control ids or menu component keys without a major bump.

## Naming / structure cues

- Vue: SFC under `modules/`, Composition API hooks
- React: TSX under matching module folders; hooks like `useMap`, `useMapInstance`, `useRegisterMapControl`
- Shared styles: package `style.css` entries and documented CSS variables — change carefully

## Checklist before finishing

- [ ] Core logic not duplicated only in one framework package
- [ ] Control ids / actions match across Vue and React (if dual)
- [ ] Dataset plugin / registry wiring still registers components
- [ ] Types exported consistently from package entry
- [ ] Demo or docs smoke path noted if UI-visible
