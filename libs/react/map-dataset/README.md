# @hungpvq/react-map-dataset

React UI for map datasets. Same core as Vue: [`@hungpvq/map-dataset`](../../map-core/map-dataset). Vue package: [`@hungpvq/vue-map-dataset`](../../vue/map-dataset).

**Docs (shared):** [Getting started](../../map-core/map-dataset/docs/index.md) · [GIS worker](../../map-core/map-dataset/docs/worker.md) · [Components](../../map-core/map-dataset/docs/module/) · [Menus](../../map-core/map-dataset/docs/create-dataset/with-helper-menu.md) · [Attribute table](../../map-core/map-dataset/docs/create-dataset/attribute-table.md)

## Install

```bash
npm install @hungpvq/react-map-dataset @hungpvq/react-map-core @hungpvq/map-dataset @hungpvq/map-core
```

```ts
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';
```

Bootstrap once (`installMapApp` = theme + dataset registry: legend, opacity, add-to-group, export, attribute table, …):

```ts
import { installMapApp } from '@hungpvq/react-map-dataset';

installMapApp();
```

Create-layer reads GIS files and reprojects CRS in a Web Worker. Apps that install the published package need `mapDatasetGisWorker()` from `@hungpvq/map-dataset/vite`. In this Nx workspace use `worker.format: 'es'` + `nxViteTsPaths()` on `worker.plugins` — see [GIS worker](../../map-core/map-dataset/docs/worker.md).

## Usage

```tsx
import type { MapSimple } from '@hungpvq/map-core';
import { Map } from '@hungpvq/react-map-core';
import {
  LayerControl,
  useMapDataset,
} from '@hungpvq/react-map-dataset';
import {
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
} from '@hungpvq/map-dataset';

function Page() {
  function onMapLoaded(map: MapSimple) {
    const { addDataset } = useMapDataset(map.id);
    const dataset = createRootDataset('Sample');
    dataset.add(createDatasetPartListViewUiComponentBuilder('Layer').build());
    addDataset(dataset);
  }

  return (
    <Map onMapLoaded={onMapLoaded}>
      <LayerControl position="top-left" show />
    </Map>
  );
}
```

Pass app state into menu conditions:

```tsx
<LayerControl menuContext={{ role: 'admin', canUsePen: true }} />
```

Or wrap with `MenuConditionProvider` from `@hungpvq/react-map-dataset`.

Import dataset builders, services, protocols, locale bags, and shared types from
`@hungpvq/map-dataset`.

## License

MIT
