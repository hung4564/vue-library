# @hungpvq/shared-log

Structured logging with ambient **zone** context (`ZoneContextStorage`) and required `.with({ fn, span })` on every line.

Every emitted `LogRecord` has a stable `id` (UUID) for UI selection / Flow.

### Log data stores (`LogDataStore`)

Queryable persistence separate from output sinks (`LogAdapter`):

| Store | Role |
|-------|------|
| `NoopLogDataStore` | Default with `ConsoleAdapter` — no retention |
| `MemoryLogDataStore` | In-memory ring buffer; optional `limit` (default **10_000**) |
| `IndexedDBLogDataStore` | Browser IndexedDB persistence (**uncapped**); `list` uses `actionId` / `namespace` indexes, then residual filters |

Write via `DataStoreLogAdapter` / `loggerFactory.setDataStore(store)`. Query with `await resolveMaybePromise(store.getAll())` / `await resolveMaybePromise(store.list(query))` (memory is sync; IndexedDB is async).

**Map Devtools** default store is IndexedDB (see [devtools.md](../../map-core/core/docs/core/devtools.md)); config lives on `getMapDebugStore()` (`map:debug`).

## Correlation IDs (schema B)

| Field | Meaning | Who mints |
|-------|---------|-----------|
| `actionId` | One user/action gesture | `ensureActionContext` (reuse when nested) |
| `spanId` | One operation frame (START/END pair) | `runWithFunctionLog` |
| `parentSpanId` | Parent frame's **`spanId`** when nested | `runWithFunctionLog` (omit at action root) |
| `requestId` | **HTTP only** | `trackRequest` (never equals `actionId`) |

**Migration:** former action-level `requestId` → `actionId`; former `functionId` → `spanId`. Writers emit new keys only. Devtools may still read legacy buffered keys when present.

### Recommended optional fields

| Field | When |
|-------|------|
| `durationMs` / `outcome` (`ok` \| `error` \| `abort`) | END/ERROR of `runWithFunctionLog`; HTTP settle |
| `errorName` / `errorMessage` | ERROR only |
| `httpMethod` / `httpStatus` / `httpUrl` | Inside `trackRequest` (URL sanitized, no query secrets) |
| `mapId`, `fn`, `span`, `control`, `menuId`, `datasetId`, … | Existing UI / domain context |

**Do not log:** GeoJSON bodies, auth tokens, large props dumps, per-iteration paint loops.

## Quick start

```ts
import { loggerFactory, runWithFunctionLog } from '@hungpvq/shared-log';

const log = loggerFactory.createLogger().setNamespace('map:identify', 2);

await loggerFactory.ensureActionContext({ mapId, span: 'identify.query' }, async () => {
  await runWithFunctionLog(
    log,
    { fn: 'runIdentify', span: 'identify.query', mapId },
    async () => {
      log.with({ fn: 'runIdentify', span: 'identify.query' }).info('done');
      // HTTP gets its own requestId; inherits actionId/spanId:
      await loggerFactory.trackRequest(
        { url: 'https://api.example/rows?token=secret', method: 'GET' },
        () => fetch('https://api.example/rows'),
      );
    },
  );
});
```

**Required on every log call:** `.with({ fn, span })`. Ambient zone supplies `actionId` / `mapId` / nested meta.

**Index:** hierarchical per method frame (`1`, `1.1`, `2`) — not a process-wide counter.

**Mitt:** `packLogEvent` / `runWithLogEvent` carry zone snapshots (`actionId`, `spanId`, `parentSpanId`) across emit boundaries. Emit logs **EMIT** only (no handler START/END).

**Agent / contributor conventions** (message quality, lifecycle, event fan-out, error/duplicate rules, review checklist): see `.cursor/skills/vue-library-overview/SKILL.md` → Logging.

## Zone storage

| Runtime | Behavior |
|---------|----------|
| Node | `AsyncLocalStorage` — concurrent chains isolated |
| Browser | Sticky until settle — `await` keeps `actionId`; **overlapping concurrent clicks can share the sticky zone** (document in Flow cookbook) |

## API

| Symbol | Role |
|--------|------|
| `loggerFactory.createLogger()` | Package logger + `setNamespace` |
| `logger.with(ctx)` / `logger.at(fn)` | Bound view |
| `getContext()` / `runWithContext` / `ensureActionContext` | Zone ambient |
| `trackRequest(meta, fn)` | HTTP boundary — mints `requestId` |
| `runWithFunctionLog` | START/END + `spanId` / `parentSpanId` + `durationMs` / `outcome` |
| `packLogEvent` / `runWithLogEvent` | Mitt / delayed fan-out |
| `sanitizeHttpUrl` | Strip query/hash for log headers |
| `LogAdapter.log(record)` | Structured record |

## Building / tests

```bash
nx build share-log
nx test share-log
```

## Standalone demo (no map)

In demo-map (Vue or React):

```bash
npm run map:dev-vue   # → http://localhost:…/#/shared-log
npm run map:dev-react # → …/#/shared-log
```

Page `#/shared-log`: `ensureActionContext`, nested spans, `trackRequest`, orphan / abort / error / concurrent — on-page buffering adapter + ConsoleAdapter. Map-integrated Flow cookbook: `#/logging-cookbook`.
