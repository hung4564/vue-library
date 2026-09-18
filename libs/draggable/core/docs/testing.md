# Testing

How `@hungpvq/draggable` / Vue / React adapters are locked in CI.

## Commands

From the monorepo root:

```bash
npm run draggable:test          # all packages tagged `draggable` (excl. demos)
npx nx test @hungpvq/draggable
npx nx test @hungpvq/vue-draggable
npx nx test @hungpvq/react-draggable
```

Release preflight also uses `npm run draggable:build` (lint + build).

## What each layer covers

| Layer | Location | Focus |
|-------|----------|--------|
| Core unit | `libs/draggable/core/src/**/*.spec.ts` | Store (`drag:core`), factories, bounds, focus/a11y helpers, menu keyboard |
| Public API lock | `*/src/public-api.spec.ts` | Root runtime exports = Stable ∪ Experimental allowlists |
| Vue adapter | `libs/vue/draggable/src/**/*.spec.ts` | Container init, chrome parts (`Drag*`), hooks, ContextMenu |
| React adapter | `libs/react/draggable/src/**/*.spec.tsx` | Same contracts as Vue (+ context / reactive store) |

There is **no** Playwright e2e project for demo-draggable yet. Prefer unit + `public-api` locks; smoke demos with `npm run draggable:dev-vue` / `draggable:dev-react` before a release.

## When you must update tests

1. **New/removed root runtime export** → update that package’s `public-api.spec.ts` + [stable-api.md](./stable-api.md).
2. **Store / item protocol** → extend `store/index.spec.ts` (notify paths, exclusivity, `useDragLayout`).
3. **Focus / Escape / menu keyboard** → extend `utils/focus.spec.ts` / `utils/menu.spec.ts` and note [a11y.md](./a11y.md).
4. **Internal chrome rename** → adapter `components.spec` should keep covering `DragButton` / `DragHeader` / `DragCard` / `DragSidebarToggle` (not public exports).

## SemVer note

Docs-only and test-only changes are **patch** on the current published line (`<!-- docs-ver:draggable.line -->1.x.x<!-- /docs-ver:draggable.line -->`). Changing documented a11y/store behavior needs a SemVer decision — see [README checklist](../../README.md#checklist-semver--breaking-change).

Next minor prep: [releases/v1.2.md](./releases/v1.2.md). Release flow: `npm run draggable:release` (`scripts/release-group.js`).
