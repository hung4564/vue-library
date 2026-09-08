# Minimal starter

Smallest useful path: **one map + one inline GeoJSON layer**. No GIS worker, no CreateControl, no draw.

Live demos: [Vue `/#/minimal/`](https://hung4564.github.io/demo-map/vue/#/minimal/) · [React `/#/minimal`](https://hung4564.github.io/demo-map/react/#/minimal)

Related: [Getting started](../index.md) · [Quick Dataset Creation](/map/dataset/helper/QuickDatasetCreation) · [GIS worker](/map/dataset/worker) (only when parsing files / heavy geo)

## Install + CSS + registry

Same as the hub [Getting started](../index.md): install packages, import `style.css`, call `createDatasetRegistryPlugin()` once.

**No** `@hungpvq/map-dataset/vite` / `mapDatasetGisWorker()` is required for this path.

## Vue

```vue
<script setup lang="ts">
import type { MapSimple } from '@hungpvq/map-core';
import { Map } from '@hungpvq/vue-map-core';
import {
  LayerControl,
  useMapDataset,
} from '@hungpvq/vue-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset';
import type { FeatureCollection } from 'geojson';

const sample: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [106.7, 10.8] },
    },
  ],
};

function onMapLoaded(map: MapSimple) {
  const { addDataset } = useMapDataset(map.id);
  addDataset(
    createGeoJsonDataset({
      name: 'Sample points',
      geojson: sample,
      type: 'point',
      color: '#e74c3c',
    }),
  );
}
</script>

<template>
  <Map @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show />
  </Map>
</template>
```

## React

Call `useMapDataset()` at the component top level (Rules of Hooks). On map load, `setMapId` then `addDataset` — `setMapId` is synchronous so both work in the same callback.

```tsx
import type { MapSimple } from '@hungpvq/map-core';
import { Map } from '@hungpvq/react-map-core';
import {
  LayerControl,
  useMapDataset,
} from '@hungpvq/react-map-dataset';
import { createGeoJsonDataset } from '@hungpvq/map-dataset';
import type { FeatureCollection } from 'geojson';

const sample: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'A' },
      geometry: { type: 'Point', coordinates: [106.7, 10.8] },
    },
  ],
};

export function MinimalMap() {
  const { addDataset, setMapId } = useMapDataset();

  function onMapLoaded(map: MapSimple) {
    setMapId(map.id);
    void addDataset(
      createGeoJsonDataset({
        name: 'Sample points',
        geojson: sample,
        type: 'point',
        color: '#e74c3c',
      }),
    );
  }

  return (
    <Map onMapLoaded={onMapLoaded}>
      <LayerControl position="top-left" show />
    </Map>
  );
}
```

## Minimal vs full GIS kit

| Need | Use |
|------|-----|
| Inline FeatureCollection / small in-memory data | **This page** (no worker) |
| Upload KML/SHP/CSV, large files, off-main-thread parse | [GIS worker](/map/dataset/worker) + CreateControl |
| Draw / edit geometries | [Draw](/map/draw/) (Vue full + React mount/save) |
| Identify / style / attribute table UX | Dataset controls + registry plugin (already required above) |
