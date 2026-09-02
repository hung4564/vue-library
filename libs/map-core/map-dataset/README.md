# @hungpvq/map-dataset

Framework-agnostic dataset model: tree of source / layer / list UI / identify nodes, menu builders, and map add/remove.

UI packages:

- Vue: [`@hungpvq/vue-map-dataset`](../../vue/map-dataset)
- React: [`@hungpvq/react-map-dataset`](../../react/map-dataset)

**Docs:** [Getting started](../../vue/map-dataset/docs/index.md) · [GeoJSON worker](../../vue/map-dataset/docs/worker.md)

```bash
npm install @hungpvq/map-dataset @hungpvq/map-core
```

Parse and CRS reproject use a Web Worker. Vite apps need:

```ts
worker: {
  format: 'es',
  // Nx path aliases — workers do not inherit main `plugins`:
  plugins: () => [nxViteTsPaths()],
},
```
