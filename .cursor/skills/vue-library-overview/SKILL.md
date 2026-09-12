---
name: vue-library-overview
description: >-
  Orients agents to the vue-library Nx monorepo (@hungpvq map, draggable, share
  packages for Vue and React). Use when starting work in this repo, locating the
  right package, choosing where to put GIS vs UI code, picking npm/nx scripts,
  or when adding logging (must use @hungpvq/shared-log, never raw console.*).
---

# Vue Library Overview

Nx + TypeScript monorepo publishing `@hungpvq/*` packages for MapLibre GIS maps, draggable UI, and shared utilities. Dual Vue 3 and React adapters sit on framework-agnostic cores.

## Package map

| Area | Paths | npm scope examples |
|------|-------|-------------------|
| Map engine | `libs/map-core/core`, `map-dataset`, `map-draw` | `@hungpvq/map-core`, `map-dataset`, `map-draw` |
| Vue map | `libs/vue/map-core`, `map-dataset`, `map-draw`, `map-devtools` | `@hungpvq/vue-map-*` |
| React map | `libs/react/map-core`, `map-dataset`, `map-draw`, `map-devtools` | `@hungpvq/react-map-*` |
| Draggable | `libs/draggable/core`, `libs/vue/draggable`, `libs/react/draggable` | `@hungpvq/draggable`, `vue-draggable`, `react-draggable` |
| Share / UI | `libs/share/*`, `libs/ui/core`, `libs/router` | `@hungpvq/shared*`, UI kit |
| Demos / docs | Nx serve demos, `docs/`, `deploy/demo-*` | VitePress sites |

Nx tags: `map`, `draggable`, `share`, `demo`, plus `core` / framework tags. Release groups: `map`, `draggable` (see root `nx.json`).

## Where to change code

1. **GIS / store / registry / workers / theme / locale** → `libs/map-core/*` (framework-agnostic).
2. **Map shell, controls, hooks (Vue)** → `libs/vue/map-*`.
3. **Same for React** → `libs/react/map-*` (keep parity with Vue when the feature is dual).
4. **Draw / edit** → protocol in `libs/map-core/map-draw`; UI in `libs/vue/map-draw` and `libs/react/map-draw` (shared InspectController). Docs: `libs/map-core/map-draw/docs` → `/map/draw/`. Demo: `/#/draw` only.
5. **Dataset builders / identify / style protocol** → `libs/map-core/map-dataset`; UI in `vue`/`react` `map-dataset`. Docs: `libs/map-core/map-dataset/docs`.
6. **Shared non-map utils** → `libs/share/*`.

Do not put MapLibre business logic only in a Vue or React package if it belongs in `map-core` / `map-dataset` / `map-draw`.

**Import paths:** cores (`@hungpvq/map-core`, `map-dataset`, `map-draw`, `draggable`) for protocol/types/services; adapters (`@hungpvq/vue-*` / `react-*`) for UI/hooks only. Adapters must not re-export core.

**Map UI buttons:** in Vue/React map packages, always use Stable `MapControlButton` (see `map-dual-framework`) — never raw `<button>` / `BaseButton` for map chrome.

## Logging (`@hungpvq/shared-log`)

**Always** log through `@hungpvq/shared-log`. Do **not** use raw `console.log` / `console.info` / `console.warn` / `console.debug` / `console.error` in libs, demos, or apps (except inside `@hungpvq/shared-log` adapters themselves).

```ts
import { loggerFactory } from '@hungpvq/shared-log';

const logger = loggerFactory.createLogger().setNamespace('demo:list', 2);
logger.info('layer selected', { mapId, layerId });
```

- Prefer a module-level `logger` with a stable namespace (`map:…`, `demo:…`, `draggable:…`).
- Map packages: use `logHelper` from `@hungpvq/map-core` when the log is map-scoped (`mapId` + extra namespaces).
- Demos: enable namespaces with `loggerFactory.enable('…')` when the page needs verbose output (see dataset-list demo).
- Replacing an existing `console.*` while touching a file is required; do not add new `console.*`.

## Common scripts (root `package.json`)

```bash
npm run map:lint          # lint + typecheck tagged map (exclude demo)
npm run map:build         # lint + build map libs
npm run map:test          # vitest tagged map (excl. demo) — includes public-api locks
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

**CHANGELOG:** do not hand-edit package `CHANGELOG.md` unless the user asks; leave it to `*:version` / Nx release (see `nx-release-workflow`, SemVer skills).

## Docs hubs

- Map SemVer + public surface: `libs/map-core/README.md`
- Map Stable API allowlist: `libs/map-core/core/docs/core/stable-api.md` (named root exports + runtime lock via `public-api.spec.ts` in map-core / map-dataset / vue|react map-*; aggregation in `internal-barrel.ts`)
- Map minimal starter: `libs/map-core/core/docs/core/minimal-starter.md` (demos `/#/minimal/`)
- Map docs index: `libs/map-core/core/docs/index.md`
- Map store / `getMap`: `libs/map-core/core/docs/core/map-store.md`
- Map error handling: `libs/map-core/core/docs/core/error-handling.md`
- Draggable SemVer + public surface: `libs/draggable/README.md` (line **1.1.x**)
- Draggable Stable API: `libs/draggable/core/docs/stable-api.md` (named exports + `public-api.spec.ts` lock)
- Draggable a11y: `libs/draggable/core/docs/a11y.md`
- Draggable testing: `libs/draggable/core/docs/testing.md`
- Draggable docs index: `libs/draggable/core/docs/index.md`
- Per-package READMEs under each lib

## React demos + workspace `libs/` source

Tsconfig paths point `@hungpvq/react-*` at `libs/**/src`. React Vite demos must **exclude `libs/` from Fast Refresh** or named exports break in the browser (`does not provide an export named …`). Pattern: `react({ exclude: [/node_modules/, /[\\/]libs[\\/]/] })` — see `draggable-semver-api` and `apps/react/demo-draggable/vite.config.ts`.

## Related skills

- Map SemVer / Stable API → `map-semver-api`
- Draggable SemVer / Stable API → `draggable-semver-api`
- Vue↔React parity → `map-dual-framework`
- Release → `nx-release-workflow`
- Docs sites → `map-docs-vitepress`
- Tests → `map-testing`
