# @hungpvq/shared-log

Structured logging with ambient **zone** context (`ZoneContextStorage`) and required `.with({ fn, span })` on every line.

Every emitted `LogRecord` has a stable `id` (UUID) for UI selection / Flow.

### Log data stores (`LogDataStore`)

Queryable persistence separate from output sinks (`LogAdapter`):

| Store                   | Role                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `NoopLogDataStore`      | Default with `ConsoleAdapter` — no retention                                                                      |
| `MemoryLogDataStore`    | In-memory ring buffer; optional `limit` (default **10_000**)                                                      |
| `IndexedDBLogDataStore` | Browser IndexedDB persistence (**uncapped**); `list` uses `actionId` / `namespace` indexes, then residual filters |

Write via `DataStoreLogAdapter` / `loggerFactory.setDataStore(store)`. Query with `await resolveMaybePromise(store.getAll())` / `await resolveMaybePromise(store.list(query))` (memory is sync; IndexedDB is async).

**Devtools** default store is IndexedDB on `log:debug` (`getLogDebugStore()`). Vue UI: `@hungpvq/vue-shared-log`. React UI: `@hungpvq/react-shared-log`. Map host: `*-map-devtools`.

## Register a debug tab (pin-first)

Packages that must **not** peer `@hungpvq/shared-log` call the process pin. First caller creates a stub; `installDebug()` adopts the same object.

```ts
import { ensureHungpvqDebugHost } from './ensure-debug-host'; // vendor copy — no shared-log import

ensureHungpvqDebugHost().registerTab({
  id: 'draggable',
  label: 'Draggable',
  order: 20,
  framework: 'vue',
  component: DraggableDebugPanel,
});
```

Copy the helper from `apps/vue/demo-map/src/views/shared-log/ensure-debug-host.ts` (React demo has the same file). First caller creates a stub on `globalThis.__hungpvqDebug`; `installDebug()` adopts that object.

Apps that already depend on shared-log can use `ensureHungpvqDebugHost()` from `@hungpvq/shared-log`, or `registerDebugTab` from `@hungpvq/vue-shared-log` / `@hungpvq/react-shared-log`. F12: `window.__hungpvqDebug.help()`.

Demo `#/shared-log` registers `app:demo` through the vendor helper (not `registerDebugTab`).

Built-in tabs (`store`, `live`, `logs`, `errors`) register when the Vue/React UI package loads. Dataset is added by `*-map-devtools`.

## Correlation IDs (schema B)

| Field          | Meaning                                 | Who mints                                  |
| -------------- | --------------------------------------- | ------------------------------------------ |
| `actionId`     | One user/action gesture                 | `ensureActionContext` (reuse when nested)  |
| `spanId`       | One operation frame (START/END pair)    | `runWithFunctionLog`                       |
| `parentSpanId` | Parent frame's **`spanId`** when nested | `runWithFunctionLog` (omit at action root) |
| `requestId`    | **HTTP only**                           | `trackRequest` (never equals `actionId`)   |

**Migration:** former action-level `requestId` → `actionId`; former `functionId` → `spanId`. Writers emit new keys only. Devtools may still read legacy buffered keys when present.

### Recommended optional fields

| Field                                                      | When                                                    |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| `durationMs` / `outcome` (`ok` \| `error` \| `abort`)      | END/ERROR of `runWithFunctionLog`; HTTP settle          |
| `errorName` / `errorMessage`                               | ERROR only                                              |
| `httpMethod` / `httpStatus` / `httpUrl`                    | Inside `trackRequest` (URL sanitized, no query secrets) |
| `mapId`, `fn`, `span`, `control`, `menuId`, `datasetId`, … | Existing UI / domain context                            |

**Do not log:** GeoJSON bodies, auth tokens, large props dumps, per-iteration paint loops.

## Quick start

```ts
import { loggerFactory, runWithFunctionLog } from '@hungpvq/shared-log';

const log = loggerFactory.createLogger().setNamespace('map:identify');

await loggerFactory.ensureActionContext({ mapId, span: 'identify.query' }, async () => {
  await runWithFunctionLog(log, { fn: 'runIdentify', span: 'identify.query', mapId }, async () => {
    log.with({ fn: 'runIdentify', span: 'identify.query' }).info('done');
    // HTTP gets its own requestId; inherits actionId/spanId:
    await loggerFactory.trackRequest({ url: 'https://api.example/rows?token=secret', method: 'GET' }, () => fetch('https://api.example/rows'));
  });
});
```

**Required on every log call:** `.with({ fn, span })`. Ambient zone supplies `actionId` / `mapId` / nested meta.

**Console (opt-in):** default `enableAll = false` — `ConsoleAdapter` is silent until `loggerFactory.enable('ns')` or `enableEverything()`. Adapters with `alwaysOn` (e.g. Devtools `DataStoreLogAdapter`) still receive every record.

**Index:** hierarchical per method frame (`1`, `1.1`, `2`) — not a process-wide counter.

**Mitt:** `packLogEvent` / `runWithLogEvent` carry zone snapshots (`actionId`, `spanId`, `parentSpanId`) across emit boundaries. Emit logs **EMIT** only (no handler START/END).

**Agent / contributor conventions** (message quality, lifecycle, event fan-out, error/duplicate rules, review checklist): see `.cursor/skills/vue-library-overview/SKILL.md` → Logging.

## Zone storage

| Runtime | Behavior                                                                                                                                |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Node    | `AsyncLocalStorage` — concurrent chains isolated                                                                                        |
| Browser | Sticky until settle — `await` keeps `actionId`; **overlapping concurrent clicks can share the sticky zone** (document in Flow cookbook) |

## API

| Symbol                                                    | Role                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------- |
| `loggerFactory.createLogger()`                            | Package logger + `setNamespace`                                  |
| `logger.with(ctx)` / `logger.at(fn)`                      | Bound view                                                       |
| `getContext()` / `runWithContext` / `ensureActionContext` | Zone ambient                                                     |
| `trackRequest(meta, fn)`                                  | HTTP boundary — mints `requestId`                                |
| `runWithFunctionLog`                                      | START/END + `spanId` / `parentSpanId` + `durationMs` / `outcome` |
| `packLogEvent` / `runWithLogEvent`                        | Mitt / delayed fan-out                                           |
| `sanitizeHttpUrl`                                         | Strip query/hash for log headers                                 |
| `LogAdapter.log(record)`                                  | Structured record                                                |

## Building / tests

```bash
nx build shared-log
nx test shared-log
# version + peer sync + tag shared-log@<ver>
npm run shared-log:release
```

## Standalone demo (no map)

In demo-map (Vue or React):

```bash
npm run map:dev-vue   # → http://localhost:…/#/shared-log
npm run map:dev-react # → …/#/shared-log
```

Page `#/shared-log`: `ensureActionContext`, nested spans, `trackRequest`, orphan / abort / error / concurrent — on-page buffering adapter + ConsoleAdapter. Map-integrated Flow cookbook: `#/logging-cookbook`.
