---
name: draggable-semver-api
description: >-
  Enforces SemVer and Stable API rules for @hungpvq draggable packages (exports,
  store key drag:core, item/location protocol, peers, CSS entry paths). Use when
  changing public API, store/notify paths, item type strings, component props, or
  preparing a draggable release bump decision.
---

# Draggable SemVer & Stable API

Packages are on **1.0.x**. SemVer is strict: breaking → **major**, additive → **minor**, fix within contract → **patch**.

## Required reading before API edits

1. `libs/draggable/README.md` — full SemVer / breaking checklist
2. `libs/draggable/core/docs/stable-api.md` — Stable allowlist vs experimental

## Bump flowchart

```
Can the change break an existing consumer (compile / runtime / CSS / store key)?
  ├─ Yes → MAJOR
  ├─ No, only adds API / components / optional props (old code still works) → MINOR
  └─ No, only bug fix / docs / perf (documented behavior unchanged) → PATCH
```

**Exception:** fixing a bug apps already rely on → prefer **minor** (or major if widespread). Note the intent for release notes; do **not** hand-edit `CHANGELOG.md` unless asked.

## CHANGELOG

- **Do not** automatically create or append entries in any package `CHANGELOG.md` during feature/fix work.
- CHANGELOG is owned by release tooling (`draggable:version` / Nx release) or an **explicit** user request.
- When proposing a bump, state SemVer + suggested bullet points in chat / PR text only.

## Treat as public / breaking

- Symbols on the [Stable API allowlist](../../libs/draggable/core/docs/stable-api.md) (root barrels are **named exports**, locked by `public-api.spec.ts`)
- Package `exports` paths: `.`, `./style.css`
- Store id `drag:core` and documented notify path prefixes
- `DraggableItemType` / `LocationSideBar` / `ItemGroupKey` string values
- Documented props/events (`show`, `v-model:show`, `onUpdateShow`, `containerId`, `location`)
- Peer minimum raises; exact `@hungpvq/draggable` pins on adapters
- Vue/React adapters share core store contracts — breaks propagate

Experimental root exports (`ManagementControl`, `ContextMenu`, …) may change in a **minor**.

## Safe patterns

- Alias: `export { Old as New }`, mark `Old` `@deprecated` for ≥1 minor, remove in a later **major**
- Prefer adding over renaming protocol strings
- Bumping `@hungpvq/draggable` major/minor requires same-release bump of `@hungpvq/vue-draggable` and `@hungpvq/react-draggable` (fixed release group). Do not publish core alone.

## When proposing a change, state

1. Packages touched
2. Stable vs experimental
3. Suggested SemVer bump
4. Peer / coordinated release needed (yes/no)
5. Docs to update (`stable-api.md`, component docs, README checklist)
