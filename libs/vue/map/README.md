# @hungpvq/vue-map

Batteries-included Vue entry for the map stack: installs core + dataset + draggable shell and re-exports `installMapApp` / `createMapAppPlugin`.

**Docs:** [Install from npm](../../map-core/core/docs/core/install-from-npm.md) · [Peers and bundle](../../map-core/core/docs/core/peers-and-bundle.md) · [Minimal starter](../../map-core/core/docs/core/minimal-starter.md)

## Install

```bash
npm install @hungpvq/vue-map maplibre-gl vue
```

Optional (print / legend expression eval):

```bash
npm install file-saver @maplibre/maplibre-gl-style-spec
```

## Bootstrap

```ts
import { createApp } from 'vue';
import { installMapApp } from '@hungpvq/vue-map';
import '@hungpvq/vue-map/style.css';

const app = createApp(App);
installMapApp(app);
app.mount('#app');
```

Or:

```ts
import { createMapAppPlugin } from '@hungpvq/vue-map';
app.use(createMapAppPlugin());
```

## What you still import from domain packages

| Need | Package |
|------|---------|
| `Map`, controls, hooks | `@hungpvq/vue-map-core` |
| `LayerControl`, dataset UI hooks | `@hungpvq/vue-map-dataset` |
| `getMap`, theme, measurement APIs | `@hungpvq/map-core` (+ `/<domain>` subpaths) |
| `createGeoJsonDataset`, identify, … | `@hungpvq/map-dataset` (+ subpaths) |
| Draw / edit | `@hungpvq/vue-map-draw` + `@hungpvq/map-draw` (separate install) |
| Devtools | `@hungpvq/vue-map-devtools` (separate install) |

Meta does **not** re-export every component — it is an install bag + bootstrap facade.

## Versioning

Ships with the **map** fixed release group (`map@{version}`). Keep `@hungpvq/map-*` / `vue-map-*` on the same minor when possible.
