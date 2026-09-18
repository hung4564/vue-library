---
name: map-docs-vitepress
description: >-
  Maintains VitePress docs and demo sites for vue-library map and draggable
  packages. Use when writing or updating module docs, Stable API docs,
  linking docs into demos, or building preview sites under docs/ or deploy/.
---

# Map Docs & VitePress

## Surfaces

| Surface | How to run | Notes |
|---------|------------|--------|
| Main docs | `npm run docs:dev` / `docs:build` | `vitepress` on `docs/`; `docs:pre-link` → `scripts/link-docs.js` |
| Map demo site | `npm run map:site:dev` / `map:site:build` / `map:site:push` | links docs + VitePress; output `deploy/demo-map` |
| Draggable demo site | `npm run draggable:site:dev` / `draggable:site:build` / `draggable:site:push` | VitePress + demos; `deploy/demo-draggable` |
| Preview | `map:site:preview` / `draggable:site:preview` | serve deploy folders |
| Release + site + group tag | `npm run map:release` / `draggable:release` | `scripts/release-group.js` → tag `map@*` / `draggable@*` (CI Publish) |

## Source-of-truth docs (map)

Prefer editing package-local markdown that the sites consume:

- Hub: `libs/map-core/core/docs/index.md`
- Install from npm (external apps): `libs/map-core/core/docs/core/install-from-npm.md`
- Minimal starter: `libs/map-core/core/docs/core/minimal-starter.md`
- Stable API: `libs/map-core/core/docs/core/stable-api.md` (runtime lock via `public-api.spec.ts`)
- SemVer checklist: `libs/map-core/README.md`
- Registry / CSS: docs under `libs/map-core/core/docs/core/` (e.g. registry-controls, css-variables)
- **Dataset:** `libs/map-core/map-dataset/docs` → junction via `scripts/link-docs.js` → `/map/dataset/`
- **Draw:** `libs/map-core/map-draw/docs` → junction → `/map/draw/` (Inspect is a **section** under draw hub, not a separate InspectControl.md page)
- Module docs: often `index.md` beside modules or under package `docs/`
- VitePress sidebar entries: `docs/.vitepress/metadata/metadata_map.json`

## Source-of-truth docs (draggable)

- Hub: `libs/draggable/core/docs/index.md`
- Stable API: `libs/draggable/core/docs/stable-api.md` (named barrels; experimental table; enforce via `public-api.spec.ts`)
- Header slots: `libs/draggable/core/docs/header-slots.md` (`pre-title` / `title` / `after-title` / `extra-btn`)
- Accessibility: `libs/draggable/core/docs/a11y.md`
- Context menu (experimental): `libs/draggable/core/docs/context-menu.md`
- SemVer checklist: `libs/draggable/README.md`
- Component docs: `libs/draggable/core/docs/draggable-*.md`
- Adapter experimental barrels: `libs/vue/draggable/src/experimental.ts`, `libs/react/draggable/src/experimental.ts`

Keep Stable docs aligned with code when changing public protocol (ids, exports, CSS tokens, store keys, a11y helpers).
When adding a root export: update `public-api.spec.ts` + `stable-api.md` together (map and draggable).

## Doc isolation (hard rule)

**`map-dataset` docs and `draggable` docs must never cross-link.**

| Do | Do not |
|----|--------|
| Describe the contract locally (slot names, `title` vs `titleNode`, shell owns Escape/focus) | Link `/map/draggable/*` from `libs/map-core/map-dataset/docs/**` |
| Name peer packages in install lines (`@hungpvq/vue-draggable`, …) | Link `/map/dataset/*` from `libs/draggable/core/docs/**` |
| Update both doc trees when a shared behavior changes (agents may edit both) | Relative paths like `../../../../draggable/core/docs/…` or `…/map-dataset/docs/…` |

Same isolation applies to VitePress routes after `link-docs.js` (`/map/dataset/` ↔ `/map/draggable/`). Map-core / map-draw hubs may still link dataset or draw sections within the map site; they must not be used as a bridge to smuggle dataset↔draggable doc links.

## Writing guidelines

- Document **control ids**, action types, and import paths consumers need.
- Split examples: UI/hooks from `@hungpvq/vue-*` / `react-*`; builders/types/services from `@hungpvq/map-core` / `map-dataset` / `map-draw` / `draggable`. Adapters must not re-export core.
- Mark experimental surfaces clearly; do not promote undocumented barrel exports to Stable without updating `stable-api.md`.
- Dual-framework features: mention Vue and React entry points / demos when both exist.
- Prefer short examples over long tutorials; link demos for full apps.
- Do not invent API that is not in the package entry.
- **Never** add markdown/VitePress links between dataset docs and draggable docs (see Doc isolation).
- Package `./style.css` must be **emitted by the Vite lib build** (CSS-only entry `src/style.ts` → `css` in `vite.config.ts`). Do not rely on monorepo tsconfig paths alone — published tarballs previously omitted `style.css` when nothing imported the CSS graph.
- Install / getting-started docs for dataset apps must list the **full** CSS set: `map-core` + `map-dataset` + framework `*-map-core` / `*-map-dataset` + `*-draggable` (Vue or React). Do **not** document “core-only instead of framework” as a substitute — each package’s CSS is separate and all are required. Map-core CSS alone does not style LayerControl / identify / create / attribute table / panels.

## When changing API

1. Update Stable allowlist or SemVer checklist if needed.
2. For map: keep `public-api.spec.ts` in sync; add VitePress sidebar rows in `metadata_map.json` for new hub pages (e.g. Stable API, Minimal starter).
3. For draggable: also update `a11y.md` / `context-menu.md` if focus/ARIA/menu keyboard changes; keep `public-api.spec.ts` in sync.
4. Update registry/CSS docs if ids or tokens change.
5. Optionally refresh demo snippets under vitepress demo scripts / linked md.
6. Run `map:site:dev` or `docs:dev` only when verifying docs (user may not need a full site build every time).
