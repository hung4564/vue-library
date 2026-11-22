---
name: shared-log-vanilla
description: >-
  @hungpvq/shared-log is vanilla JS only — no Vue, React, SFC, or JSX.
  useLiveHookDebug / LiveHookScope live in vue-shared-log and react-shared-log.
  Use when editing libs/shared-log/core, live-hook, DebugRecord, emitLiveRecord,
  useLiveHookDebug, shared-log/vue, shared-log/react, or adding a log/live hook.
---

# Shared-log is vanilla JS

`libs/shared-log/core` (`@hungpvq/shared-log`) is framework-agnostic: types, Logger, zone, stores, `emitLiveRecord`, instance registry, `trackLiveEventAction`, debug host. **No Vue. No React.**

## Placement

| Code                                                                                | Package                                                                                       |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Envelope, Logger, IDB, `emitLiveRecord`, `registerInstance`, `trackLiveEventAction` | `@hungpvq/shared-log`                                                                         |
| `useLiveHookDebug` (Vue)                                                            | `@hungpvq/vue-shared-log`                                                                     |
| `useLiveHookDebug` + `LiveHookScope` (React)                                        | `@hungpvq/react-shared-log`                                                                   |
| Devtools viewers / tabs                                                             | same `*-shared-log` UI packages                                                               |
| Thin map wrappers (not public)                                                      | `vue-map-core` / `react-map-core` `hooks/useLiveHookDebug.ts` — re-export from `*-shared-log` |

## Forbidden in `libs/shared-log/core`

- `import` from `vue` or `react` (including `react/jsx-runtime`)
- `.vue` / `.tsx` / `.jsx`
- package `exports` `./vue` or `./react`
- `peerDependencies` on `vue` or `react`
- tsconfig paths `@hungpvq/shared-log/vue` or `@hungpvq/shared-log/react`

Consumers import hooks from `@hungpvq/vue-shared-log` / `@hungpvq/react-shared-log`, never `@hungpvq/shared-log/vue` or `/react`.

Producers (map-core, draggable, demos) that call the hook must peer the matching `*-shared-log` package. They may still peer `@hungpvq/shared-log` for `emitLiveRecord` / `trackLiveEventAction`.

## When adding live-hook or log UI

1. Put protocol in `@hungpvq/shared-log` (plain `.ts`).
2. Bind UI / Composition / hooks in `libs/shared-log/vue` and `libs/shared-log/react`.
3. Update that package `public-api.spec.ts`. Do **not** add a framework subpath on shared-log.
4. Keep `vanilla.spec.ts` green (no `src/vue` or `src/react` folders).
5. Process state (`events`, registries, flags) goes on `getLogDebugStore` / a new `ensure*` via `@hungpvq/shared-store` — **shared-store-state**. Do not add module `let` bags.
