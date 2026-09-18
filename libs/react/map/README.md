# @hungpvq/react-map

Batteries-included React entry for the map stack: installs core + dataset + draggable shell and re-exports `installMapApp`.

**Docs:** [Install from npm](../../map-core/core/docs/core/install-from-npm.md) · [Peers and bundle](../../map-core/core/docs/core/peers-and-bundle.md) · [Minimal starter](../../map-core/core/docs/core/minimal-starter.md)

## Install

```bash
npm install @hungpvq/react-map maplibre-gl react react-dom
```

Optional (print / legend expression eval):

```bash
npm install file-saver @maplibre/maplibre-gl-style-spec
```

## Bootstrap

Call once at the app entry (before the first map mounts):

```ts
import { installMapApp } from '@hungpvq/react-map';
import '@hungpvq/react-map/style.css';

installMapApp();
```

## What you still import from domain packages

| Need | Package |
|------|---------|
| `Map`, controls, hooks | `@hungpvq/react-map-core` |
| `LayerControl`, dataset UI hooks | `@hungpvq/react-map-dataset` |
| `getMap`, theme, measurement APIs | `@hungpvq/map-core` (+ `/<domain>` subpaths) |
| `createGeoJsonDataset`, identify, … | `@hungpvq/map-dataset` (+ subpaths) |
| Draw / edit | `@hungpvq/react-map-draw` + `@hungpvq/map-draw` (separate install) |
| Devtools | `@hungpvq/react-map-devtools` (separate install) |

Meta does **not** re-export every component — it is an install bag + bootstrap facade.

## Versioning

Ships with the **map** fixed release group (`map@{version}`). Keep `@hungpvq/map-*` / `react-map-*` on the same minor when possible.
