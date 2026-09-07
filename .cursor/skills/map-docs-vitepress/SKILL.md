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
| Map demo site | `npm run map:site:dev` / `map:site:build` | links docs + `scripts/vitepress-demo-map.js`; output `deploy/demo-map` |
| Draggable demo site | `npm run draggable:site:dev` / `draggable:site:build` | `scripts/vitepress-demo-draggable.js`; `deploy/demo-draggable` |
| Preview | `map:site:preview` / `draggable:site:preview` | serve deploy folders |

## Source-of-truth docs (map)

Prefer editing package-local markdown that the sites consume:

- Hub: `libs/map-core/core/docs/index.md`
- Stable API: `libs/map-core/core/docs/core/stable-api.md`
- SemVer checklist: `libs/map-core/README.md`
- Registry / CSS: docs under `libs/map-core/core/docs/core/` (e.g. registry-controls, css-variables)
- Module docs: often `index.md` beside modules or under package `docs/`

## Source-of-truth docs (draggable)

- Hub: `libs/draggable/core/docs/index.md`
- Stable API: `libs/draggable/core/docs/stable-api.md`
- SemVer checklist: `libs/draggable/README.md`
- Component docs: `libs/draggable/core/docs/draggable-*.md`

Keep Stable docs aligned with code when changing public protocol (ids, exports, CSS tokens, store keys).

## Writing guidelines

- Document **control ids**, action types, and import paths consumers need.
- Mark experimental surfaces clearly; do not promote undocumented barrel exports to Stable without updating `stable-api.md`.
- Dual-framework features: mention Vue and React entry points / demos when both exist.
- Prefer short examples over long tutorials; link demos for full apps.
- Do not invent API that is not in the package entry.

## When changing API

1. Update Stable allowlist or SemVer checklist if needed.
2. Update registry/CSS docs if ids or tokens change.
3. Optionally refresh demo snippets under vitepress demo scripts / linked md.
4. Run `map:site:dev` or `docs:dev` only when verifying docs (user may not need a full site build every time).
