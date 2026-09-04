# Worker monitor

`WorkerMonitor` is a framework-agnostic registry in `@hungpvq/map-core`. Any web worker client can **connect**, then report **status**, **progress**, **logs**, and **errors**. `WorkerControl` (Vue / React) lists every registered worker. When several are registered, pick one from the list (search + busy-first) to inspect it.

The GIS parse / CRS worker in `@hungpvq/map-dataset` is already wired (`id: 'geojson'`).

Live demo (sum-range task + `WorkerControl`): Vue `#/worker-sample/`, React `#/worker-sample` — see `apps/vue/demo-map/src/workers/` and `apps/react/demo-map/src/workers/`.

## Connect a worker (main thread)

```ts
import { WorkerMonitor } from '@hungpvq/map-core';

export const MY_WORKER_ID = 'my-worker';

const client = WorkerMonitor.connect({
  id: MY_WORKER_ID,
  name: 'My worker',
  createWorker: () =>
    new Worker(new URL('./my.worker.ts', import.meta.url), { type: 'module' }),
});

export async function runHeavyTask(payload: unknown) {
  return client.runTask(
    'heavy-task',
    {
      engine: 'worker',
      run: async (taskId) => {
        const response = await client.post({
          id: taskId,
          type: 'heavy-task',
          payload,
        });
        if (!response.ok) throw new Error(response.error);
        return response.result;
      },
    },
    {
      engine: 'main',
      run: async () => runOnMainThread(payload),
    },
  );
}
```

`WorkerMonitor.connect` registers the worker, lazily creates the `Worker`, applies monitor envelopes from `postMessage`, tracks pending tasks, and wraps `runMonitoredTask` (optional main-thread fallback).

You can still call `runMonitoredTask` / `handle.startTask` manually if you need a custom client.

## Bind inside the worker thread

Use the **worker-only** package entry — it does not load CSS/DOM from the main `@hungpvq/map-core` barrel:

```ts
import { runWorkerMonitor } from '@hungpvq/map-core/worker';

runWorkerMonitor(
  async (message, ctx) => {
    ctx.log(`heavy-task start detail`);
    ctx.report(0, 100, 'work');
    const result = await doWork(message.payload, ctx.report);
    return { result };
  },
  { readyMessage: 'My worker ready' },
);
```

Published as `exports["./worker"]` → `worker.js` (built separately from `index.js`). In this monorepo, `tsconfig` maps `@hungpvq/map-core/worker` to `in-worker.ts`.

`ctx`:

| API | Role |
| --- | --- |
| `ctx.taskId` | Same as `message.id` |
| `ctx.log(message, { level? })` | Log **with** `taskId` |
| `ctx.report(current, total?, message?)` | Throttled progress (~80ms; always sends when done) |

Runtime also:

- Forwards `console.*` as **worker-level** logs (**no** `taskId`)
- Posts `{type} start` / `done` / `error` with `taskId`
- Replies `{ id, ok: true, ...result }` or `{ id, ok: false, error }`

## Progress / log envelopes

Still available if you post manually. The main-thread `onmessage` handler (inside `connect`) calls `applyWorkerMonitorMessage` **before** treating the event as a task result.

```ts
self.postMessage({
  __workerMonitor: true,
  kind: 'progress',
  taskId: message.id,
  current: 12,
  total: 100,
  message: 'reproject',
});
```

```ts
self.postMessage({
  __workerMonitor: true,
  kind: 'log',
  level: 'info',
  taskId: message.id,
  message: 'reproject 12000 features from EPSG:3405',
});
```

## Inspect without the control

```ts
import { WorkerMonitor } from '@hungpvq/map-core';

WorkerMonitor.get('geojson');
WorkerMonitor.list();
const stop = WorkerMonitor.subscribe(() => {
  console.info(WorkerMonitor.list());
});
```

| API | Role |
| --- | --- |
| `WorkerMonitor.connect({ id, name, createWorker, … })` | Register + wire a Worker instance |
| `client.post` / `client.runTask` / `client.terminate` | Talk to the worker |
| `runWorkerMonitor(handler, options?)` | Bind inside the worker thread |
| `register(id, { name })` | Create or reuse a handle only |
| `handle.startTask / setProgress / completeTask / failTask` | Manual lifecycle |
| `handle.setStatus / setLastError` | Runtime state of the Worker instance |
| `runMonitoredTask(id, type, primary, fallback?)` | Wrap one job + optional main-thread fallback |
| `applyWorkerMonitorMessage(id, data)` | Apply progress **or** log `postMessage` |
| `handle.log({ level, message, taskId })` | Append a log line on the main thread |
| `clearHistory(id?)` | Clear logs/history for one worker, or all if omitted |
| `subscribe(listener)` | UI updates |

`WorkerControl` shows:
- **Task log** — live lines for the **running** task only (`taskId` while pending)
- **Worker log** — committed history (worker-level lines without `taskId`, plus a task’s lines **after** it finishes and is flushed)
- **Recent tasks** — last **5** finished tasks (older tasks and their logs are removed from memory), each with a compact log snippet

Map control: [WorkerControl](./module/WorkerControl.md). GeoJSON Vite setup: [GeoJSON worker](/map/dataset/worker).
