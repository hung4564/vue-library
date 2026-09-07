---
name: vue-library-overview
description: >-
  Orients agents to the vue-library Nx monorepo (@hungpvq map, draggable, share
  packages for Vue and React). Use when starting work in this repo, locating the
  right package, choosing where to put GIS vs UI code, or picking npm/nx scripts.
---

# Vue Library Overview

Nx + TypeScript monorepo publishing `@hungpvq/*` packages for MapLibre GIS maps, draggable UI, and shared utilities. Dual Vue 3 and React adapters sit on framework-agnostic cores.

## Package map

| Area | Paths | npm scope examples |
|------|-------|-------------------|
| Map engine | `libs/map-core/core`, `libs/map-core/map-dataset` | `@hungpvq/map-core`, `@hungpvq/map-dataset` |
| Vue map | `libs/vue/map-core`, `map-dataset`, `map-draw`, `map-devtools` | `@hungpvq/vue-map-*` |
| React map | `libs/react/map-core`, `map-dataset`, `map-devtools` | `@hungpvq/react-map-*` |
| Draggable | `libs/draggable/core`, `libs/vue/draggable`, `libs/react/draggable` | `@hungpvq/draggable`, `vue-draggable`, `react-draggable` |
| Share / UI | `libs/share/*`, `libs/ui/core`, `libs/router` | `@hungpvq/shared*`, UI kit |
| Demos / docs | Nx serve demos, `docs/`, `deploy/demo-*` | VitePress sites |

Nx tags: `map`, `draggable`, `share`, `demo`, plus `core` / framework tags. Release groups: `map`, `draggable` (see root `nx.json`).

## Where to change code

1. **GIS / store / registry / workers / theme / locale** → `libs/map-core/*` (framework-agnostic).
2. **Map shell, controls, hooks (Vue)** → `libs/vue/map-*`.
3. **Same for React** → `libs/react/map-*` (keep parity with Vue when the feature is dual).
4. **Draw / edit** → `libs/vue/map-draw` only (React draw not shipped yet).
5. **Dataset builders / identify / style protocol** → `libs/map-core/map-dataset`; UI in `vue`/`react` `map-dataset`.
6. **Shared non-map utils** → `libs/share/*`.

Do not put MapLibre business logic only in a Vue or React package if it belongs in `map-core` / `map-dataset`.

## Common scripts (root `package.json`)

```bash
npm run map:lint          # lint + typecheck tagged map (exclude demo)
npm run map:build         # lint + build map libs
npm run map:dev-vue       # nx serve vue-demo-map
npm run map:dev-react     # nx serve react-demo-map
npm run map:site:dev      # link docs + VitePress demo-map
npm run map:release       # nx release --group=map
npm run map:release:local # version+publish to localhost:4873

npm run draggable:build
npm run draggable:test
npm run draggable:dev-vue / draggable:dev-react
npm run share:build

npm run docs:dev          # VitePress docs/
npm run build / lint / ts-check   # run-many --all
```

Commits: Conventional Commits (`@commitlint/config-conventional`). Prefer `npm run commit` / git-cz when helping authors.

## Docs hubs

- Map SemVer + public surface: `libs/map-core/README.md`
- Map Stable API allowlist: `libs/map-core/core/docs/core/stable-api.md`
- Map docs index: `libs/map-core/core/docs/index.md`
- Draggable SemVer + public surface: `libs/draggable/README.md`
- Draggable Stable API: `libs/draggable/core/docs/stable-api.md`
- Draggable docs index: `libs/draggable/core/docs/index.md`
- Per-package READMEs under each lib

## Related skills

- Map SemVer / Stable API → `map-semver-api`
- Draggable SemVer / Stable API → `draggable-semver-api`
- Vue↔React parity → `map-dual-framework`
- Release → `nx-release-workflow`
- Docs sites → `map-docs-vitepress`
- Tests → `map-testing`
