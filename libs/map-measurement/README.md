# Getting start

## Install

```
npm i @hungpvq/vue-map-measurement
```

```
yarn add @hungpvq/vue-map-measurement
```

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
import { MeasurementControl } from '@hungpvq/vue-map-measurement';
import '@hungpvq/vue-map-measurement/style.css';
</script>

<template>
  <Map>
    <MeasurementControl />
  </Map>
  <BaseMapCard :mapId="mapId" />
</template>
```

## Component

<!--@include: ./src/modules/MeasurementControl.md -->
