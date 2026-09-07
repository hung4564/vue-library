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

## What to test first

Prefer fast unit tests for:

- `UniversalRegistry` / `filterMapControls` / control handle behavior
- Theme helpers (`bootstrapMapTheme`, resolve/apply class, storage key)
- `DatasetService` ordering and tree operations
- Pure utils (no MapLibre GL canvas) — mock map instances when needed

Avoid heavy browser/MapLibre integration unless the user asks; demos and Playwright e2e are separate.

## Commands

```bash
npx nx test @hungpvq/map-core
npx nx test @hungpvq/map-dataset
npm run draggable:test   # tag:draggable excl. demo
npx nx test @hungpvq/draggable
npx nx test @hungpvq/vue-draggable
npx nx test @hungpvq/react-draggable
# or project name from project.json
```

Ensure `tsconfig.spec.json` / vite test config exist when adding the first spec to a package (see `libs/map-core/map-dataset` as a recent pattern).

## Draggable public-api lock

Draggable packages lock **runtime** root exports with `public-api.spec.ts` (core / vue / react). When changing `src/index.ts` or `experimental.ts`, update the allowlist arrays in that spec and `libs/draggable/core/docs/stable-api.md`. See skill `draggable-semver-api`.

## Conventions

- Name files `*.spec.ts` beside the module under test
- Keep tests deterministic; no network; mock workers if touching worker protocol
- Do not assert on undocumented experimental internals as if they were Stable — if locking behavior, note it
- After behavior changes to Stable protocol, add/adjust tests and point docs at `map-semver-api` / `draggable-semver-api` / `map-docs-vitepress` if needed

## Checklist

- [ ] Spec covers the regression or new contract
- [ ] No real MapLibre WebGL dependency unless unavoidable
- [ ] Package test target runs via Nx
- [ ] Types resolve (`tsconfig.spec.json` / vitest types)
