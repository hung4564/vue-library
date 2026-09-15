# @hungpvq/map-dataset

Framework-agnostic dataset model: tree of source / layer / list UI / identify nodes, menu builders, and map add/remove.

UI packages:

- Vue: [`@hungpvq/vue-map-dataset`](../../vue/map-dataset)
- React: [`@hungpvq/react-map-dataset`](../../react/map-dataset)

**Docs:** [Getting started](./docs/index.md) · [GIS worker](./docs/worker.md) · [CreateControl](./docs/module/CreateControl.md)

```bash
npm install @hungpvq/map-dataset @hungpvq/map-core
```

For **CreateControl** / GIS file import, also install optional format peers:

```bash
npm i shpjs papaparse jszip topojson-client @tmcw/togeojson @xmldom/xmldom
```

- Create-layer / GIS parse runs in a Web Worker shipped as `assets/geojson.worker.js`.
- **Vite:** add `mapDatasetGisWorker()` (excludes package from `optimizeDeps` so `import.meta.url` stays under `node_modules`).
- **Native ESM:** zero config if package files stay together.
- **Webpack / CDN / static:** copy `@hungpvq/map-dataset/geojson-worker` and call `configureGisWorker({ url })` — see [GIS worker](./docs/worker.md).

In this Nx monorepo (source), configure `worker.format` + `nxViteTsPaths` on `worker.plugins` instead.
