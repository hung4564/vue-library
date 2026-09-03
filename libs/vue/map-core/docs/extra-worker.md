# Worker monitor

`WorkerMonitor` is a framework-agnostic registry in `@hungpvq/map-core`. Any web worker client can register, then report **status**, **progress**, **logs**, and **errors**. `WorkerControl` (Vue / React) lists every registered worker. When several are registered, pick one from the list (search + busy-first) to inspect it.

The GIS parse / CRS worker in `@hungpvq/map-dataset` is already wired (`id: 'geojson'`).

## Register a worker

```ts
import { WorkerMonitor, runMonitoredTask } from '@hungpvq/map-core';

export const MY_WORKER_ID = 'my-worker';

const handle = WorkerMonitor.register(MY_WORKER_ID, { name: 'My worker' });

export async function runHeavyTask(payload: unknown) {
  return runMonitoredTask(
    MY_WORKER_ID,
    'heavy-task',
    {
      engine: 'worker',
      run: async (taskId) => {
        const worker = getWorker(); // your Worker instance
        return postToWorker(worker, { id: taskId, type: 'heavy-task', payload });
      },
    },
    {
      engine: 'main',
      run: async () => runOnMainThread(payload),
    },
  );
}

handle.setStatus('idle'); // after the Worker is created
handle.setStatus('unavailable'); // if new Worker() fails
```

`runMonitoredTask` records start → success / error, then runs the fallback on the **main thread** when the worker path throws.

## Progress from the worker thread

Post this envelope from the worker (`self.postMessage`). The main-thread `onmessage` handler should call `applyWorkerMonitorProgress` **before** treating the event as a task result:

```ts
// worker
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
// client
worker.onmessage = (event) => {
  if (applyWorkerMonitorProgress(MY_WORKER_ID, event.data)) return;
  // handle the real task response
};
```

`current` / `total` drive the progress bar. Omit `total` for an indeterminate bar.

## Logs from the worker thread

Same envelope, `kind: 'log'`. `console.log` / `warn` / `error` inside the GeoJSON worker are forwarded automatically.

```ts
self.postMessage({
  __workerMonitor: true,
  kind: 'log',
  level: 'info', // debug | info | warn | error
  taskId: message.id,
  message: 'reproject 12000 features from EPSG:3405',
});
```

```ts
worker.onmessage = (event) => {
  if (applyWorkerMonitorMessage(MY_WORKER_ID, event.data)) return;
  // handle the real task response
};
```

`applyWorkerMonitorMessage` applies both progress and log envelopes. Logs show in the WorkerControl sidebar.

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
| `register(id, { name })` | Create or reuse a handle |
| `handle.startTask / setProgress / completeTask / failTask` | Manual lifecycle |
| `handle.setStatus / setLastError` | Runtime state of the Worker instance |
| `runMonitoredTask(id, type, primary, fallback?)` | Wrap one job + optional main-thread fallback |
| `applyWorkerMonitorProgress(id, data)` | Apply a progress `postMessage` |
| `applyWorkerMonitorMessage(id, data)` | Apply progress **or** log `postMessage` |
| `handle.log({ level, message, taskId })` | Append a log line on the main thread |
| `clearHistory(id?)` | Clear logs/history for one worker, or all if omitted |
| `subscribe(listener)` | UI updates |

Map control: [WorkerControl](./module/WorkerControl.md). GeoJSON Vite setup: [GeoJSON worker](/map/dataset/worker).
