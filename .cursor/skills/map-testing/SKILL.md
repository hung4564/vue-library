---
name: map-testing
description: >-
  Adds and runs unit tests for @hungpvq map and related libs using Vitest via
  Nx Vite. Use when writing *.spec.ts, testing registry, theme, dataset
  services, or verifying map-core / map-dataset behavior without full demos.
---

# Map Testing

## Stack

- **Vitest** configured in package `vite.config.ts` (`/// <reference types='vitest' />`)
- Nx Vite plugin exposes `test` target; Jest also exists in the repo for some packages — prefer **Vitest** for map-core / map-dataset libs that already use it
- Specs live next to source: `*.spec.ts` (e.g. `filter-map-controls.spec.ts`, `theme.spec.ts`, `dataset.service.spec.ts`)
- Map packages that import MapLibre at module top-level use `src/test-setup.ts` (mocks `maplibre-gl` / related CJS peers)

## What to test first

Prefer fast unit tests for:

- `UniversalRegistry` / `filterMapControls` / control handle behavior
- Theme helpers (`bootstrapMapTheme`, resolve/apply class, storage key)
- `DatasetService` ordering and tree operations
- `createGeoJsonDataset` / identify builders / `parseGisText` (fixtures; no WebGL)
- `createDatasetRegistryPlugin().install()` smoke (Vue + React) — registry keys resolve
- `DrawService` / `FeatureStore` / history (no WebGL) + draw `public-api.spec.ts`
- Pure utils (no MapLibre GL canvas) — mock map instances when needed

### UI smoke (adapter packages)

Allowed when covering Map shell / control registration under jsdom:

- Enrich `src/test-setup.ts` MapLibre mock (`on` / `once` / `load`) + `ResizeObserver` / `matchMedia`
- Stub `MapInitializer.validateWebglSupport` / `isWebglSupported` / optionally `setupMapEvents` to fire `onLoad`
- Specs: `Map.ui.spec.ts(x)`, `controls.ui.spec.ts(x)` mounting `Map` + `LayerControl` + `IdentifyControl`
- Assert registry `getControl(...)` and Teleport host nodes — not full identify query flows

Avoid heavy browser/MapLibre GL integration beyond that; demos use Playwright e2e:

```bash
npm run map:e2e
# or
npx nx e2e vue-demo-map-e2e
npx nx e2e react-demo-map-e2e
```

Smoke specs under `apps/*/demo-map-e2e`:

| Spec | Route | Focus |
|------|-------|--------|
| `minimal.spec.ts` | `/#/minimal` | Map shell + canvas |
| `layer-identify.spec.ts` | `/#/dataset-identify` | LayerControl + IdentifyControl mount |
| `attribute-table.spec.ts` | `/#/dataset-attribute-table` | Open table + toolbar/grid smoke |
| `create-control.spec.ts` | `/#/minimal` | CreateControl raw GeoJSON → new layer |

## Commands

```bash
npx nx test @hungpvq/map-core
npx nx test @hungpvq/map-dataset
npx nx test @hungpvq/map-draw
npx nx test @hungpvq/vue-map-core
npx nx test @hungpvq/vue-map-dataset
npx nx test @hungpvq/vue-map-draw
npx nx test @hungpvq/react-map-core
npx nx test @hungpvq/react-map-dataset
npx nx test @hungpvq/react-map-draw
npm run map:test   # tag:map excl. demo — includes public-api locks when wired
npm run draggable:test   # tag:draggable excl. demo
npx nx test @hungpvq/draggable
npx nx test @hungpvq/vue-draggable
npx nx test @hungpvq/react-draggable
# or project name from project.json
```

Ensure `tsconfig.spec.json` / vite `test:` block exist when adding the first spec to a package (see `libs/map-core/map-dataset` / `libs/vue/map-core`).

## Map public-api lock

Map packages lock **runtime** root exports with `public-api.spec.ts` (Stable ∪ Experimental exact match), parallel to draggable:

| Package | Spec |
|---------|------|
| `@hungpvq/map-core` | `libs/map-core/core/src/public-api.spec.ts` |
| `@hungpvq/map-dataset` | `libs/map-core/map-dataset/src/public-api.spec.ts` |
| `@hungpvq/map-draw` | `libs/map-core/map-draw/src/public-api.spec.ts` |
| `@hungpvq/vue-map-core` | `libs/vue/map-core/src/public-api.spec.ts` |
| `@hungpvq/vue-map-dataset` | `libs/vue/map-dataset/src/public-api.spec.ts` |
| `@hungpvq/vue-map-draw` | `libs/vue/map-draw/src/public-api.spec.ts` |
| `@hungpvq/react-map-core` | `libs/react/map-core/src/public-api.spec.ts` |
| `@hungpvq/react-map-dataset` | `libs/react/map-dataset/src/public-api.spec.ts` |
| `@hungpvq/react-map-draw` | `libs/react/map-draw/src/public-api.spec.ts` |

When changing `src/index.ts` named exports (or `internal-barrel.ts` aggregation), update the allowlist arrays in that spec and `libs/map-core/core/docs/core/stable-api.md` (if Stable). See skill `map-semver-api`. Do **not** reintroduce public `export *` on `index.ts`.

## Draggable public-api lock

Draggable packages lock **runtime** root exports with `public-api.spec.ts` (core / vue / react). When changing `src/index.ts` or `experimental.ts`, update the allowlist arrays in that spec and `libs/draggable/core/docs/stable-api.md`. See skill `draggable-semver-api`.

## Conventions

- Name files `*.spec.ts` beside the module under test
- Keep tests deterministic; no network; mock workers if touching worker protocol
- Do not assert on undocumented experimental internals as if they were Stable — if locking behavior, note it
- After behavior changes to Stable protocol, add/adjust tests and point docs at `map-semver-api` / `draggable-semver-api` / `map-docs-vitepress` if needed
- Prefer importing builders from package root (`../index`) in dataset specs when circular `export *` graphs leave mid-tree bindings incomplete

## Checklist

- [ ] Spec covers the regression or new contract
- [ ] No real MapLibre WebGL dependency unless unavoidable
- [ ] Package test target runs via Nx
- [ ] Types resolve (`tsconfig.spec.json` / vitest types)
- [ ] Root export changes updated `public-api.spec.ts` (+ Stable docs if needed)
