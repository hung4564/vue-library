# Draggable libraries (`@hungpvq/*`)

Framework-agnostic draggable layout kit with Vue and React adapters.

| Package | Description |
|---------|-------------|
| [`@hungpvq/draggable`](./core/) | Types, store (`drag:core`), utils, shared CSS |
| [`@hungpvq/vue-draggable`](../vue/draggable/) | Vue container, items, hooks, store wiring |
| [`@hungpvq/react-draggable`](../react/draggable/) | React container, items, hooks, context, store wiring |

**Docs hub:** [core/docs/index.md](./core/docs/index.md) · **Stable API:** [core/docs/stable-api.md](./core/docs/stable-api.md) · **Demos:** [Vue](https://hung4564.github.io/demo-draggable/vue/) · [React](https://hung4564.github.io/demo-draggable/react/)

---

# Checklist SemVer / Breaking Change

Packages are on **`1.0.x`** — SemVer applies strictly: breaking → **major**, additive → **minor**, fix within contract → **patch**. Root barrels use `export *`, so **almost every exported symbol is public API** unless explicitly marked otherwise on the Stable allowlist.

## 0. Surface map (version together)

| Package | Public entries | Peer lock notes |
|---------|----------------|-----------------|
| `@hungpvq/draggable` | `.` + `./style.css` | peer `@hungpvq/shared-store` |
| `@hungpvq/vue-draggable` | `.` + `./style.css` | peer `@hungpvq/draggable` **`~1.0.1`**, `vue`, `vue-draggable-resizable` |
| `@hungpvq/react-draggable` | `.` + `./style.css` | peer `@hungpvq/draggable` **`~1.0.1`**, React 18, `react-rnd` |

**Monorepo rule:** Nx release group `draggable` uses `projectsRelationship: fixed`. Bumping `@hungpvq/draggable` major/minor requires the same release of Vue + React adapters. Do not publish core alone when peers pin an exact version.

## 1. Bump decision — quick flowchart

```
Can the change break an existing consumer (compile / runtime / CSS / store key)?
  ├─ Yes → MAJOR (1.x → 2.0.0)
  ├─ No, only adds API / components / optional props (old code still works) → MINOR
  └─ No, only bug fix / docs / perf (documented behavior unchanged) → PATCH
```

**Exception:** fixing a bug that apps already rely on → prefer **minor** (or major if widespread). Document in CHANGELOG either way.

## 2. BREAKING checklist (→ major)

Any checked item must **not** ship in `1.0.x` / as a `1.x` patch.

### A. Module / package graph

- [ ] Remove or rename a package
- [ ] Change `exports` so old import paths fail (`.`, `./style.css`)
- [ ] Drop dual `import` / `require` while apps still use CJS
- [ ] Rename npm scope / package name
- [ ] Raise peer **minimum** outside the old range (e.g. React 18 → 19 required, exact `@hungpvq/draggable` pin break)
- [ ] Change optional peer → required

### B. Named exports (TypeScript / ESM)

Treat everything on the [Stable allowlist](./core/docs/stable-api.md) as public. Root barrels are **named exports** locked by `public-api.spec.ts`. Experimental symbols (`ManagementControl`, `ContextMenu`, …) may change in a **minor**.

Breaking if you:

- [ ] Remove / rename a **Stable** export (`useDragItem`, `DraggableContainer`, `WithMobileHandle`, …)
- [ ] Change function/class signature incompatibly
- [ ] Narrow an exported Stable `interface` / `type`
- [ ] Change `DraggableItemType` / `LocationSideBar` / `ItemGroupKey` string unions consumers compare
- [ ] Tighten generics so inference fails for previous call sites

**Safe alias (minor):** `export { Old as New }` keep `Old` `@deprecated` for ≥1 minor, remove in a later **major**.

### C. Runtime protocol

#### Store key / notify paths

- [ ] Change defineStore id `drag:core`
- [ ] Change notify path shape apps subscribe to (`['drag:core', 'container', containerId]`, component card paths)

#### Item / location protocol

- [ ] Rename `item-popup` / `item-float` / `item-bottom` / `item-modal` / `item-sidebar` / `item-drawer` type strings
- [ ] Change `LocationSideBar` values (`left` \| `right` \| `top` \| `bottom`)
- [ ] Change z-order semantics of group `show[]` (last = top) if documented
- [ ] Change sidebar/drawer exclusivity (one `show` id per location) if documented
- [ ] Change bottom exclusivity (`bottom.show?: string` vs multi `show[]`) if documented

### D. CSS

- [ ] Remove or rename the Stable `./style.css` export path
- [ ] Change documented class hooks / tokens once they are listed on stable-api.md

### E. Component props / events (Vue & React)

- [ ] Rename props (`show`, `containerId`, `location`, …)
- [ ] Rename Vue `v-model:show` / `@update:show` or React `onUpdateShow`
- [ ] Change slot / children contracts of Stable shells
- [ ] Change defaults that alter documented flow (default `show`, default location, …)

### F. Cross-package coupling

- [ ] Breaking change in `@hungpvq/draggable` store/types also breaks Vue/React adapters — bump majors together
- [ ] Exact peer pin on `@hungpvq/draggable` requires coordinated release

## 3. NON-BREAKING → minor

- [ ] New exports (functions, components, types)
- [ ] New optional props / optional peers
- [ ] New documented CSS tokens while keeping old ones
- [ ] Widen peer ranges when truly compatible (document)
- [ ] Deprecate via JSDoc `@deprecated` without removing

## 4. → patch

- [ ] Bug fix within documented contract
- [ ] Performance / internal logging
- [ ] Docs / demos only
- [ ] Types that more accurately describe **existing** runtime behavior — careful: stricter `.d.ts` that fail previous compiles are **major**
- [ ] Style tweaks that do not touch documented Stable CSS

## 5. Pre-release process checklist

### Pre-merge

1. [ ] List changed files/exports (`src/index.ts`, `experimental.ts`, barrels, `package.json#exports`)
2. [ ] Update `public-api.spec.ts` allowlists if runtime exports changed
3. [ ] Scan runtime strings: `drag:core`, item type strings, `LocationSideBar`
4. [ ] Diff props/events / a11y against `core/docs/*` (`stable-api.md`, `a11y.md`, component docs)
5. [ ] Confirm Vue **and** React keep the same contract where both ship the feature
6. [ ] Peer matrix: `draggable` ↔ `vue-draggable` / `react-draggable`
7. [ ] Choose `major` | `minor` | `patch` and write one “why” line for CHANGELOG

### Release

7. [ ] Bump **together** every package in the fixed `draggable` release group
8. [ ] CHANGELOG: `BREAKING CHANGES` + migration
9. [ ] Verify Vue + React demos build on the new versions

### After release (1.x discipline)

10. [ ] Do not quietly amend contracts in patches
11. [ ] Keep `@deprecated` for ≥1 minor before removal

## 6. Common changes → suggested bump

| Change | Bump |
|--------|------|
| Add optional item prop | minor |
| Add Stable a11y helper (`restoreFocus`, …) | minor |
| Rename `drag:core` store id | major |
| Rename `item-popup` type string | major |
| Add new Stable component export | minor |
| Remove `useDragItem` export | major |
| Change `v-model:show` / `onUpdateShow` contract | major |
| Raise React peer to 19 only | major |
| Internal store refactor, same API | patch |
| Docs-only Stable API / a11y updates | patch |
| ManagementControl / ContextMenu-only change (experimental) | patch/minor — note experimental |
| Vite demo Fast Refresh exclude only | patch (tooling) |

## 7. Reducing “everything is breaking”

1. **Stable API allowlist:** [core/docs/stable-api.md](./core/docs/stable-api.md) — SemVer promises apply here.
2. **Named root barrels** — packages use explicit exports (no `export *`). Runtime surface is locked by `public-api.spec.ts` in each package (`core` / `vue` / `react`).
3. Mark the rest **experimental** (`experimental.ts` + docs table) — may change in a **minor**. Still re-exported from the root for 1.x compat.
4. Prefer peer ranges like `^1.0.1` over long-lived exact `1.0.1` once release process is stable.
5. **React Vite demos:** exclude workspace `libs/` from `@vitejs/plugin-react` Fast Refresh (`react({ exclude: [/node_modules/, /[\\/]libs[\\/]/] })`). Otherwise browser ESM reports missing named exports from path-aliased source. See `apps/react/demo-draggable/vite.config.ts`.
6. **React store:** do not re-export `useStoreReactive` from `store/index.ts` (circular with `useStoreReactive.ts`).

## 8. Team policy (one line)

> **Major** if compile, store/item protocol, peer minimum, or documented behavior breaks.  
> **Minor** if additive only (including new Stable a11y helpers).  
> **Patch** if fix within the published contract.  
> Prefer the [Stable API allowlist](./core/docs/stable-api.md) for SemVer promises. Experimental root exports may change in a **minor**.
