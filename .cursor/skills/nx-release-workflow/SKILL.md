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

## `nx.json` release contract

| Group | Relationship | Tag | GitHub Release | Peers within group |
|-------|--------------|-----|----------------|--------------------|
| `draggable` | fixed | `draggable@{version}` | yes (`createRelease`) | `versionPrefix: "^"` → `^MAJOR.0.0` (1.x.x) + `updateDependents: auto` |
| `map` | fixed | `map@{version}` | yes | same |
| `packages` | independent | `{projectName}@{version}` | no | `updateDependents: never` |

- **Version step:** no commit/tag (`release.version.git`); stage only.
- **Changelog step:** commit + tag + push (`release.changelog.git`) then GitHub Release.
- **preVersionCommand:** build only that group (`tag:draggable` / `tag:map`), never `--all`.
- Current version comes from **git-tag** matching `releaseTagPattern` (fallback: disk). Keep tags aligned with `package.json`.
- Cross-group **peer** deps are synced by `scripts/sync-workspace-peers.js` after version (wired in `release-group.js`) → `^MAJOR.0.0`. Manual: `npm run draggable:peers:sync` / `map:peers:sync`.

## Pre-flight

1. Clean working tree for the packages you release (or know what will be included).
2. Confirm SemVer intent with `map-semver-api` for map packages, or `draggable-semver-api` for draggable packages.
3. Build/lint the target group before version/publish.

## Map group

```bash
npm run map:lint
npm run map:build
npm run map:release            # Nx releaseTag map@<ver> + site push (scripts/release-group.js)
npm run map:site:push -- --version 1.0.2
npm run map:release:local
```

**Coordination:** map group is **`fixed`** (lockstep). Tag via `releaseTagPattern` `map@{version}`.

Tag pattern (nx.json): `draggable@{version}` / `map@{version}`. With conventional commits, current version comes from the latest matching git tag (must stay aligned with `package.json`).

## Draggable group

Confirm bump with `draggable-semver-api`. Fixed group: bump core + Vue + React together.

```bash
npm run draggable:build
npm run draggable:test
npm run draggable:release          # version → docs sync → site → Nx changelog/commit/tag/push (draggable@<ver>)
# flags: node scripts/release-group.js draggable minor --skip-site|--skip-push|--dry-run|--local-publish
npm run draggable:docs:sync
npm run draggable:site:push -- --version 1.2.0
npm run draggable:release:local
```

After release, GitHub Actions Publish matches tags `draggable@*` / `map@*` (same as `nx.json` `releaseTagPattern`) and runs `nx release publish --group=…`.

`nx release changelog` also writes each package `CHANGELOG.md` and creates/updates a **GitHub Release** (`createRelease: "github"`). Needs `GH_TOKEN` / `GITHUB_TOKEN` (or `gh auth login`) and git push enabled.

**Bootstrap:** with conventional commits, Nx resolves the current version from git tags. If `package.json` is ahead of the latest `draggable@*` / `map@*` tag, create a one-time align tag (e.g. `git tag draggable@1.1.0`) before releasing.

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

- Do **not** run `map:release` / `draggable:release` / publish to public npm unless the user explicitly asks.
- Prefer `map:lint` + `map:build` (or project-scoped nx) to validate changes.
- After version bumps, ensure peer dependency ranges in sibling packages stay consistent.
- Do not force-push or skip hooks unless the user explicitly requests it.
- **Do not** hand-edit package `CHANGELOG.md` files unless the user explicitly asks. Leave changelog generation to `*:version` / Nx release (or a dedicated user request).
- Release orchestrator pushes `deploy/demo-*` submodules and tags `draggable@*` / `map@*` (triggers CI Publish) — requires clean intent and network credentials.
