# Create Control

Dialog to add a GeoJSON / raster / vector dataset from the UI. `LayerControl` opens this when **Create layer** is clicked — you usually do **not** mount it yourself.

GeoJSON / KML / GPX / Shapefile file read, parse, and CRS reproject run in a [Web Worker](../worker.md). Configure Vite `worker.format: 'es'` (and `nxViteTsPaths` on `worker.plugins` in this Nx workspace) or large files fall back to the main thread and can freeze the UI. Mount [WorkerControl](/map/core/module/WorkerControl) to watch progress and errors.

## Optional GIS peers

`@hungpvq/map-dataset` does **not** bundle GIS format parsers. Install them in the app when using CreateControl / file import:

```bash
npm i shpjs papaparse jszip topojson-client @tmcw/togeojson @xmldom/xmldom
```

| Format | Peer(s) |
| --- | --- |
| GeoJSON / GeoJSONL / WKT | none (`parseGisText` sync) |
| CSV | `papaparse` |
| KML / GPX | `@tmcw/togeojson`, `@xmldom/xmldom` |
| TopoJSON | `topojson-client` |
| ZIP / KMZ | `jszip` (+ KML peers for KMZ) |
| Shapefile | `shpjs` |

Programmatic parse: `parseGisTextAsync` / `loadGis*Async` from `@hungpvq/map-dataset/create-control` — see [GIS worker](../worker.md).

## UX notes

- The dialog keeps a small draft in `sessionStorage` (type, name, CRS) via `loadCreateControlDraft` / `saveCreateControlDraft`.
- If loaded file CRS differs from selected CRS, UI warns that data will be reprojected.
- Multi-file upload accepts one GIS file, or one shapefile set (`.shp` + sidecars / `.zip`).

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Required | Effect |
| --- | --- | --- | --- |
| `show` | `boolean` | yes | Open the dialog |

## Events

| Name | Payload | Framework |
| --- | --- | --- |
| `update:show` | `boolean` | Vue (`v-model:show`) |
| `onShowChange` | `(show: boolean) => void` | React |

## Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { Map } from '@hungpvq/vue-map-core';
import { CreateControl } from '@hungpvq/vue-map-dataset';

const open = ref(false);
</script>

<template>
  <Map>
    <CreateControl v-model:show="open" />
  </Map>
</template>
```

## React

```tsx
const [open, setOpen] = useState(false);
<CreateControl show={open} onShowChange={setOpen} />
```
