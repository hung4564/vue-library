# WorkerControl

Left sidebar inspector for **any** registered web worker: runtime status, task progress, errors, and recent history. Same panel pattern as EventManagementControl. Workers do not appear until their client calls `WorkerMonitor.register` (GeoJSON parse / CRS does this automatically).

With **more than one** worker, the sidebar shows a searchable list (busy first). Select a worker to inspect its tasks, logs, and history. Clear applies to the selected worker; **Clear all** wipes every worker.

Each running task shows a **Cancel** button that calls `WorkerMonitor.abortTask(workerId, taskId)` (posts an abort envelope to the worker; does not terminate the whole Worker unless you call `terminate`).

**Anti-flicker:** `useWorkerMonitor` projects snapshots through `createWorkerUiDelayState` — busy / loading chrome appears only after a short delay (~200ms). Faster tasks never change the status badge or show a running-task loader. Once shown, busy stays briefly (~300ms) so the UI does not flash idle.

## Usecase

- Confirm a task is running off the main thread (status **Busy**, engine **Worker**).
- Watch progress while a large GeoJSON file is read or reprojected.
- Read **worker-thread logs**: live **task log** while a task runs; when it finishes those lines flush into the **Worker log**, and a compact copy stays under **Recent tasks** (max 5). Log lists are **newest on top** (`workerLogsForDisplay`) and stay pinned to the latest lines while you follow the top of the list.
- See fallback to the main thread and the last error without opening DevTools.

## Props

<!--@include: ./props.md-->

and

| Prop   | Description              | Type      | Required | Default Value |
| ------ | ------------------------ | --------- | -------- | ------------- |
| `show` | Open the panel initially | `boolean` | `false`  | `false`       |

## Events

None.

## Usage

### Vue

```vue
<script setup lang="ts">
import { Map, WorkerControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map-core/style.css';
</script>

<template>
  <Map>
    <WorkerControl position="top-left" />
  </Map>
</template>
```

### React

```tsx
import { Map, WorkerControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map>
  <WorkerControl position="top-left" />
</Map>
```

Register your own worker and report progress: [Worker monitor](../extra-worker.md).
