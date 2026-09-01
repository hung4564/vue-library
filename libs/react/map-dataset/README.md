# @hungpvq/react-map-dataset

React UI for map datasets. Same core as Vue: [`@hungpvq/map-dataset`](../../map-core/map-dataset). Vue package: [`@hungpvq/vue-map-dataset`](../../vue/map-dataset).

**Docs (shared):** [Getting started](../../vue/map-dataset/docs/index.md) · [Components](../../vue/map-dataset/docs/module/) · [Menus](../../vue/map-dataset/docs/create-dataset/with-helper-menu.md) · [Attribute table](../../vue/map-dataset/docs/create-dataset/attribute-table.md)

## Install

```bash
npm install @hungpvq/react-map-dataset @hungpvq/react-map-core @hungpvq/map-dataset @hungpvq/map-core
```

```ts
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';
```

Register built-in components once (legend, opacity, add-to-group, export, attribute table, …):

```ts
import { createDatasetRegistryPlugin } from '@hungpvq/react-map-dataset';

createDatasetRegistryPlugin().install();
```

## Usage

```tsx
import type { MapSimple } from '@hungpvq/map-core';
import { Map } from '@hungpvq/react-map-core';
import {
  LayerControl,
  useMapDataset,
  createRootDataset,
  createDatasetPartListViewUiComponentBuilder,
} from '@hungpvq/react-map-dataset';

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

## License

MIT
