# @hungpvq/map-dataset

Framework-agnostic dataset model: tree of source / layer / list UI / identify nodes, menu builders, and map add/remove.

UI packages:

- Vue: [`@hungpvq/vue-map-dataset`](../../vue/map-dataset)
- React: [`@hungpvq/react-map-dataset`](../../react/map-dataset)

**Docs:** [Getting started](./docs/index.md) · [GIS worker](./docs/worker.md)

```bash
npm install @hungpvq/map-dataset @hungpvq/map-core
```

Create-layer / GIS parse runs in a Web Worker. Apps that install this package from npm must sync the worker file into `public/assets` — use the Vite plugin (do not copy by hand):

```ts
import { mapDatasetGisWorker } from '@hungpvq/map-dataset/vite';

export default defineConfig({
  plugins: [vue(), mapDatasetGisWorker()],
});
```

In this Nx monorepo (source), configure `worker.format` + `nxViteTsPaths` on `worker.plugins` instead — see [GIS worker](./docs/worker.md).
