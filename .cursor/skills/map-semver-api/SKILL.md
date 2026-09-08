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
   - `libs/vue/map-core/src/public-api.spec.ts` / `libs/vue/map-dataset/src/public-api.spec.ts`
   - `libs/react/map-core/src/public-api.spec.ts` / `libs/react/map-dataset/src/public-api.spec.ts`

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

- Symbols on the [Stable API allowlist](../../libs/map-core/core/docs/core/stable-api.md) (root barrels are **named exports**, locked by `public-api.spec.ts`)
- Package `exports` paths: `.`, `./style.css`, `./worker`, `./vite`, `./assets/*`
- Control ids (`mapLayerControl`, …), action types, `MapControlHandle` shape
- `LIST_VIEW_MENU_ID` / `LIST_VIEW_MENU_COMPONENT_KEY` **string values**
- `MAP_STORE_KEY.*`, `MAP_THEME_STORAGE_KEY`, documented `--map-*` / `map-theme-*`
- Peer minimum raises; optional peer → required
- Vue/React dataset packages **re-export** Stable (+ Experimental) `@hungpvq/map-dataset` symbols by name — breaks propagate

Experimental root exports (listed in each `*_EXPERIMENTAL_RUNTIME_EXPORTS`) may change in a **minor**.

## Export lock rule

- Root `src/index.ts` uses **explicit named exports** only (no public `export *`). Implementation aggregation: `src/internal-barrel.ts` (not a package entry). First-party types: explicit `export type { … }` only — do **not** `export type *` or re-export types from third-party JS libraries (`geojson`, `maplibre-gl`, …).
- Add/remove a **runtime** root export → update `index.ts` named list + Stable **or** Experimental allowlist in that package’s `public-api.spec.ts` **and** `stable-api.md` when Stable.
- Experimental may change in a **minor**; removing experimental from the root barrel is a **major**.

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
5. Docs to update (`stable-api.md`, `public-api.spec.ts`, registry docs, README checklist)
