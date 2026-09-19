# @hungpvq/shared-log

Structured logging. Context is bound per call via `logger.with(...)`.

## Quick start

```ts
import { loggerFactory } from '@hungpvq/shared-log';

const log = loggerFactory.createLogger().setNamespace('map:identify', 2);

log.with({ fn: 'runIdentify', span: 'identify.query', mapId }).info('done');
```

**Required on every log call:** `.with({ fn, span })` — `fn` is the enclosing function/method name; `span` is the phase (prefer existing dotted spans like `menu.action`, `store.init`). Do not call bare `log.info(...)` / `logger.error(...)` without `.with(...)`. When known, also pass `mapId` / `datasetId` / `datasetName` / `datasetType` / `menuId` / `menuName` (never invent).

Console prefix example:

`[INFO][map:identify][mapId=…][req=…][span=identify.query][fn=…] message`

## API

| Symbol | Role |
|--------|------|
| `loggerFactory.createLogger()` | Package logger + `setNamespace` |
| `logger.with(ctx, extraNs?)` / `logger.at(fn)` | Bound view (no mutate parent namespaces) |
| `LogAdapter.log(record: LogRecord)` | Structured record (`header` + `args`) |

**Peer:** `@hungpvq/shared` (for `getUUIDv4` when minting per-line `requestId`).

Optional header fields `flowKind` / `flowDepth` / `parentFn` / `functionId` remain on the type for older buffered Devtools entries; producers do not write them for now.

## Custom adapters

```ts
import type { LogAdapter, LogRecord } from '@hungpvq/shared-log';

const adapter: LogAdapter = {
  alwaysOn: true,
  log(record: LogRecord) {
    // record.header.requestId, mapId, span, fn, namespaces, ts, level
    // record.args
  },
};
loggerFactory.addAdapter(adapter);
```

## Building / tests

```bash
nx build share-log
nx test share-log
```
