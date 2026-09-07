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

## Bump flowchart

```
Can the change break an existing consumer (compile / runtime / CSS / registry key)?
  ├─ Yes → MAJOR
  ├─ No, only adds API / keys / themes / controls (old code still works) → MINOR
  └─ No, only bug fix / docs / perf (documented behavior unchanged) → PATCH
```

**Exception:** fixing a bug apps already rely on → prefer **minor** (or major if widespread). Document in CHANGELOG.

## Treat as public / breaking

- Anything reached via root `export *` unless listed as experimental on stable-api.md
- Package `exports` paths: `.`, `./style.css`, `./worker`, `./vite`, `./assets/*`
- Control ids (`mapLayerControl`, …), action types, `MapControlHandle` shape
- `LIST_VIEW_MENU_ID` / `LIST_VIEW_MENU_COMPONENT_KEY` **string values**
- `MAP_STORE_KEY.*`, `MAP_THEME_STORAGE_KEY`, documented `--map-*` / `map-theme-*`
- Peer minimum raises; optional peer → required
- Vue/React dataset packages **re-export** `@hungpvq/map-dataset` — breaks propagate

## Safe patterns

- Alias: `export { Old as New }`, mark `Old` `@deprecated` for ≥1 minor, remove in a later **major**
- Prefer adding over renaming protocol strings
- Bumping `@hungpvq/map-core` major/minor usually requires same-release bump of adapters + dataset + draw (exact/`~` peers). Do not publish core alone.

## When proposing a change, state

1. Packages touched  
2. Stable vs experimental  
3. Suggested SemVer bump  
4. Peer / coordinated release needed (yes/no)  
5. Docs to update (`stable-api.md`, registry docs, README checklist)
