# Map Measurement docs

> Distance, area, radius, and angle tools for Vue and React map apps

## Introduction

Measurement lives in `@hungpvq/map-core/measurement` (MapView layers, GeoJSON download helpers, units) with thin hosts `MeasurementControl` on `@hungpvq/vue-map-core` and `@hungpvq/react-map-core`. Use it for high-precision distance / area / angle / radius on MapLibre maps, custom actions, unit preferences, and export.

## 📦 Installation

### Vue

```bash
npm install @hungpvq/vue-map-core
```

### React

```bash
npm install @hungpvq/react-map-core
```

## 🎯 Features

- ✅ **Distance measurement** – Measure distances between points
- ✅ **Area measurement** – Calculate areas of polygons
- ✅ **Radius measurement** – Center + edge point (radius + circumference)
- ✅ **Angle and bearing** – Measure azimuth and the angle formed by three points
- ✅ **Unit preference** – Distance (auto/m/km/ft/mi) and area (auto/m²/km²/ha/acre) in the setting popup
- ✅ **Custom actions** – Extend measurement tools with your own actions
- ✅ **High precision** – Accurate calculations using Turf.js
- ✅ **Export support** – Export results to GeoJSON, KML, CSV, and JSON
- ✅ **TypeScript support** – Full TypeScript typings
- ✅ **Vue + React** – Same control id and core MapView on both adapters

## Usage

### With Map Core

#### Vue

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <!-- Core controls -->
    <ZoomControl position="top-right" />
    <HomeControl position="top-right" />

    <!-- Measurement controls -->
    <MeasurementControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map, ZoomControl, HomeControl } from '@hungpvq/vue-map-core';
import { MeasurementControl } from '@hungpvq/vue-map-core';
</script>
```

#### React

```tsx
import { Map, ZoomControl, HomeControl, MeasurementControl } from '@hungpvq/react-map-core';
import '@hungpvq/react-map-core/style.css';

<Map mapId={mapId} onMapLoaded={onMapLoaded}>
  <ZoomControl position="top-right" />
  <HomeControl position="top-right" />
  <MeasurementControl position="top-right" />
</Map>
```

### With Dataset Management

#### Vue

```vue
<template>
  <Map :mapId="mapId" @map-loaded="onMapLoaded">
    <LayerControl position="top-left" show>
      <template #endList="{ mapId }">
        <MeasurementControl :mapId="mapId" />
      </template>
    </LayerControl>
    <MeasurementControl position="top-right" />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { MeasurementControl } from '@hungpvq/vue-map-core';
import { LayerControl } from '@hungpvq/vue-map-dataset';
</script>
```

#### React

```tsx
import { Map, MeasurementControl } from '@hungpvq/react-map-core';
import { LayerControl } from '@hungpvq/react-map-dataset';
import '@hungpvq/react-map-core/style.css';
import '@hungpvq/react-map-dataset/style.css';

<Map mapId={mapId} onMapLoaded={onMapLoaded}>
  <LayerControl
    position="top-left"
    show
    endList={({ mapId }) => <MeasurementControl mapId={mapId} />}
  />
  <MeasurementControl position="top-right" />
</Map>
```

### Usage Notes

- Modes: point, distance, area, azimuth, **angle** (3 points), and **radius** (toolbar action `radius` / `angle`).
- Open the measurement setting popup to pick preferred distance/area units (`setMeasurementDistanceUnit` / `setMeasurementAreaUnit` on `@hungpvq/map-core/measurement`). `auto` keeps the previous m/km and m²/km² thresholds.
- You can provide custom actions via the `actions` prop to extend the measurement workflow (e.g., export, add to layer).
- Overlay source/layer bootstrap is Stable `createMeasurementMapView` — adapters only register images and toolbar UI. See [MeasurementControl](./module/MeasurementControl.md).

## Links

- **[GitHub Repository](https://github.com/hung4564/vue-library)**
- **[Documentation](/)**
- **[Issues](https://github.com/hung4564/vue-library/issues)**
