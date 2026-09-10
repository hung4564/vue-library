---
name: map-semver-api
description: >-
  Enforces SemVer and Stable API rules for @hungpvq map packages (exports,
  registry ids, peers, CSS tokens, package exports). Use when changing public
  API, control/menu ids, store keys, theme/CSS contracts, or preparing a map
  release bump decision.
---

# Map SemVer & Stable API

Packages are on **1.0.x**. SemVer is strict: breaking → **major**, additive → **minor**, fix within contract → **patch**.

## Required reading before API edits

1. `libs/map-core/README.md` — full SemVer / breaking checklist
2. `libs/map-core/core/docs/core/stable-api.md` — Stable allowlist vs experimental
3. Matching `public-api.spec.ts` for the package you touch (runtime `Object.keys` lock):
   - `libs/map-core/core/src/public-api.spec.ts`
   - `libs/map-core/map-dataset/src/public-api.spec.ts`
   - `libs/map-core/map-draw/src/public-api.spec.ts`
   - `libs/vue/map-core/src/public-api.spec.ts` / `libs/vue/map-dataset/src/public-api.spec.ts` / `libs/vue/map-draw/src/public-api.spec.ts`
   - `libs/react/map-core/src/public-api.spec.ts` / `libs/react/map-dataset/src/public-api.spec.ts` / `libs/react/map-draw/src/public-api.spec.ts`

## Bump flowchart

```
Can the change break an existing consumer (compile / runtime / CSS / registry key)?
  ├─ Yes → MAJOR
  ├─ No, only adds API / keys / themes / controls (old code still works) → MINOR
  └─ No, only bug fix / docs / perf (documented behavior unchanged) → PATCH
```

**Exception:** fixing a bug apps already rely on → prefer **minor** (or major if widespread). Note the intent for release notes; do **not** hand-edit `CHANGELOG.md` unless asked.

## CHANGELOG

- **Do not** automatically create or append entries in any package `CHANGELOG.md` during feature/fix work.
- CHANGELOG is owned by release tooling (`map:version` / Nx release) or an **explicit** user request.
- When proposing a bump, state SemVer + suggested bullet points in chat / PR text only.

## Treat as public / breaking

- Symbols on the [Stable API allowlist](../../libs/map-core/core/docs/core/stable-api.md) (root **and** `@hungpvq/map-core/<domain>` barrels are **named exports**, locked by `public-api.spec.ts`)
- Package `exports` paths: `.`, `./style.css`, `./worker`, domain subpaths (`./basemap`, `./crs`, `./event`, `./image`, `./legend`, `./measurement`, `./menu`, `./print`, `./theme`, `./toolbar`), plus dataset `./vite`, `./assets/*`, and dataset domain subpaths (`./geojson`, `./raster`, `./vector-tile`, `./identify`, `./menu`, `./style`, `./create-control`, `./geo-export`)
- Control ids (`mapLayerControl`, …), action types, `MapControlHandle` shape
- `LIST_VIEW_MENU_ID` / `LIST_VIEW_MENU_COMPONENT_KEY` **string values** (from `@hungpvq/map-dataset/menu`)
- `MAP_STORE_KEY.*`, `MAP_THEME_STORAGE_KEY`, documented `--map-*` / `map-theme-*`
- Peer minimum raises; optional peer → required
- Adapters (`vue-*` / `react-*`) must **not** re-export core protocol/types/services — consumers import platform APIs from `@hungpvq/map-core` and domain APIs from `@hungpvq/map-core/<domain>` (or `@hungpvq/map-dataset` / `@hungpvq/map-dataset/<domain>` / `map-draw` / `draggable`)

Experimental root/subpath exports (listed in each `*_EXPERIMENTAL_RUNTIME_EXPORTS` or adapter `*_FIELDS_RUNTIME_EXPORTS`) may change in a **minor**. Vue/React `map-core` publish field/UI helpers (`Input*`, `MapCard`, …) on **`./fields`** (not the root barrel); action buttons use Stable root `MapControlButton`. Other map packages may keep Experimental lists empty.

## Export lock rule

- Root and domain `src/index.ts` / `src/<domain>/index.ts` use **explicit named exports** only (no public `export *`). Implementation aggregation: `src/internal-barrel.ts` (not a package entry). First-party types: explicit `export type { … }` only — do **not** `export type *` or re-export types from third-party JS libraries (`geojson`, `maplibre-gl`, …).
- Add/remove a **runtime** export on root **or** a subpath → update that entry’s named list + Stable **or** Experimental allowlist in `public-api.spec.ts` **and** `stable-api.md` when Stable.
- Moving a symbol from root onto a subpath **without** a root re-export is a **major**. Adding a **new** subpath while keeping root is usually a **minor**.
- Experimental may change in a **minor**; removing experimental from a published barrel is a **major**.

## Safe patterns

- Alias: `export { Old as New }`, mark `Old` `@deprecated` for ≥1 minor, remove in a later **major**
- Prefer adding over renaming protocol strings
- Bumping `@hungpvq/map-core` **minor/major** usually requires same-release bump of adapters + dataset + draw (`~1.0.1` peers allow patch-only drift). Do not publish a breaking/minor core alone.
- Prefer in-family peers `~1.0.1` (not long-lived exact `1.0.1`).

## When proposing a change, state

1. Packages touched  
2. Stable vs experimental  
3. Suggested SemVer bump  
4. Peer / coordinated release needed (yes/no)  
5. Docs to update (`stable-api.md`, `public-api.spec.ts`, registry docs, README checklist; for draw also `libs/map-core/map-draw/docs`)

## Draw Stable surface (quick)

- Core: `DrawService`, `DrawingType` / `DrawingTypeName`, `MAP_DRAW_EVENT`, `MapDrawOption`, `MapDraw`, `StaticMode`, `getDrawStyles`, `getFeatureId` / `sameFeature`
- Adapters: `DrawControl`, `InspectControl`, `useMapDraw`, `isDraftOption`, `DRAW_CONTROL_LOCALE`, `INSPECT_CONTROL_LOCALE` (no core re-exports)
- Ids: `mapDrawDraftList`, `mapInspectControl`
- Package CSS entry: `./style.css`
- Consumer docs: `libs/map-core/map-draw/docs` (Inspect = section in hub, not `InspectControl.md`)
