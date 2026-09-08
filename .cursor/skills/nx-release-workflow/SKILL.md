---
name: nx-release-workflow
description: >-
  Runs Nx lint, build, version, and publish workflows for map, draggable, and
  share release groups in vue-library. Use when releasing packages, bumping
  versions, publishing to npm or local Verdaccio, or verifying pre-release
  builds.
---

# Nx Release Workflow

Independent versioning via Nx release groups in root `nx.json`. Conventional Commits drive version when using release tooling.

## Pre-flight

1. Clean working tree for the packages you release (or know what will be included).
2. Confirm SemVer intent with `map-semver-api` for map packages, or `draggable-semver-api` for draggable packages.
3. Build/lint the target group before version/publish.

## Map group

```bash
npm run map:lint
npm run map:build
npm run map:version          # nx release version --group=map
npm run map:release          # nx release --group=map
```

Local registry (Verdaccio on `http://localhost:4873`):

```bash
npm run map:release:local
```

(`--git-commit=false --git-tag=false` then publish to local registry.)

**Coordination:** in-family map peers use `~1.0.1` (patch drift OK). If `@hungpvq/map-core` bumps **minor/major**, bump adapters + dataset + draw in the **same** release. Do not publish a breaking/minor core alone.

## Draggable group

Confirm bump with `draggable-semver-api` (`libs/draggable/README.md`, `libs/draggable/core/docs/stable-api.md`). Fixed group: bump core + Vue + React together.

```bash
npm run draggable:build
npm run draggable:test
npm run draggable:version
npm run draggable:release
npm run draggable:release:local
```

## Share

```bash
npm run share:build
npm run share:release        # lint, build, nx-release-publish for tag:share
```

## Single-package Nx

```bash
npx nx run <project>:lint
npx nx run <project>:build
npx nx run <project>:ts-check
npx nx run <project>:test
```

Project names match package names (e.g. `@hungpvq/map-core`). Build output under `dist/{projectRoot}`; `nx-release-publish` uses `packageRoot: dist/{projectRoot}`.

## Agent rules

- Do **not** run `map:release` / publish to public npm unless the user explicitly asks.
- Prefer `map:lint` + `map:build` (or project-scoped nx) to validate changes.
- After version bumps, ensure peer dependency ranges in sibling packages stay consistent.
- Do not force-push or skip hooks unless the user explicitly requests it.
- **Do not** hand-edit package `CHANGELOG.md` files unless the user explicitly asks. Leave changelog generation to `*:version` / Nx release (or a dedicated user request).
