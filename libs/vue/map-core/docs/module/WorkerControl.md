# WorkerControl

Left sidebar inspector for **any** registered web worker: runtime status, task progress, errors, and recent history. Same panel pattern as EventManagementControl. Workers do not appear until their client calls `WorkerMonitor.register` (GeoJSON parse / CRS does this automatically).

With **more than one** worker, the sidebar shows a searchable list (busy first). Select a worker to inspect its tasks, logs, and history. Clear applies to the selected worker; **Clear all** wipes every worker.

## Usecase

- Confirm a task is running off the main thread (status **Busy**, engine **Worker**).
- Watch progress while a large GeoJSON file is read or reprojected.
- Read **worker-thread logs** (`console.*` and explicit `kind: 'log'` messages).
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
