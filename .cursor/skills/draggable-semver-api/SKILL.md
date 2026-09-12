---
name: draggable-semver-api
description: >-
  Enforces SemVer and Stable API rules for @hungpvq draggable packages (exports,
  store key drag:core, item/location protocol, peers, CSS entry paths, a11y
  helpers, public-api lock tests). Use when changing public API, store/notify
  paths, item type strings, component props, a11y surface, or preparing a
  draggable release bump decision.
---

# Draggable SemVer & Stable API

Packages are on **1.1.x**. SemVer is strict: breaking → **major**, additive → **minor**, fix within contract → **patch**.

## Required reading before API edits

1. `libs/draggable/README.md` — full SemVer / breaking checklist
2. `libs/draggable/core/docs/stable-api.md` — Stable allowlist vs experimental
3. `libs/draggable/core/docs/a11y.md` — when changing focus/ARIA/menu keyboard behavior
4. `libs/draggable/core/docs/testing.md` — unit / public-api lock expectations

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
- Documented a11y helpers (`focusFirst`, `restoreFocus`, `trapTabKey`, `handleMenuKeydown`, …) and panel contracts on `a11y.md`
- **Escape-to-close** when focus is inside Stable shells (modal, popup, float, drawer, sidebar, bottom) — documented minor behavior; do not remove without a SemVer decision
- Peer minimum raises; `@hungpvq/draggable` `~1.1.0` pins on adapters
- Vue/React adapters share core store contracts — breaks propagate
- Adapters must **not** re-export core types/factories (`createEmpty*`, `itemTypeToGroup`, …); import those from `@hungpvq/draggable`
- Internal panel chrome (`DragButton`, `DragCard`, `DragHeader`, `DragSidebarToggle`) is **not** public — renaming it is patch unless a documented prop/contract changes

Experimental root exports (`ManagementControl`, `ContextMenu`, …) may change in a **minor**. Source: `experimental.ts` in each adapter (still re-exported from root for 1.x compat).

## Public API lock (required when touching barrels)

Root `src/index.ts` must use **named exports only** — never reintroduce `export *`.

| Package | Lock file |
|---------|-----------|
| `@hungpvq/draggable` | `libs/draggable/core/src/public-api.spec.ts` |
| `@hungpvq/vue-draggable` | `libs/vue/draggable/src/public-api.spec.ts` |
| `@hungpvq/react-draggable` | `libs/react/draggable/src/public-api.spec.ts` |

When adding/removing a **runtime** export:

1. Edit `index.ts` (and `experimental.ts` if experimental)
2. Update the matching `public-api.spec.ts` allowlist arrays (Stable vs Experimental)
3. Update `stable-api.md` tables
4. Run `npx nx test <package>` (or `npm run draggable:test`)

Type-only exports are erased at runtime and are **not** in the lock arrays — still document them on `stable-api.md`.

## Safe patterns

- Alias: `export { Old as New }`, mark `Old` `@deprecated` for ≥1 minor, remove in a later **major**
- Prefer adding over renaming protocol strings
- Bumping `@hungpvq/draggable` major/minor requires same-release bump of `@hungpvq/vue-draggable` and `@hungpvq/react-draggable` (fixed release group). Do not publish core alone
- Prefer `import type` for React type-only imports from `react` / props types (avoids Vite ESM “missing export” noise)
- React: keep `useStoreReactive` **out of** `store/index.ts` re-exports; import from `store/useStoreReactive.ts` (avoids circular barrel that breaks Vite named exports)

## React demos / Vite Fast Refresh

Workspace apps resolve `@hungpvq/react-*` to **source under `libs/`**. `@vitejs/plugin-react` Fast Refresh on those files rewrites exports and causes browser errors like:

`does not provide an export named 'DraggableContainer' | 'DragHeader' | …`

**Rule:** React Vite demos must exclude `libs/` from the React plugin:

```ts
react({ exclude: [/node_modules/, /[\\/]libs[\\/]/] })
```

Already applied on `apps/react/demo-draggable` and `apps/react/demo-map`. Apply the same pattern to any new React app that path-aliases into `libs/`.

## When proposing a change, state

1. Packages touched
2. Stable vs experimental
3. Suggested SemVer bump
4. Peer / coordinated release needed (yes/no)
5. Docs to update (`stable-api.md`, `a11y.md` if focus/ARIA, component docs, README checklist, `public-api.spec.ts`)
