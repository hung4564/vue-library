# Getting start

## Install

```
npm i @hungpv97/vue-map-measurement
```

```
yarn add @hungpv97/vue-map-measurement
```

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpv97/vue-map-core';
import '@hungpv97/vue-map/style.css';
import { MeasurementControl } from '@hungpv97/vue-map-measurement';
import '@hungpv97/vue-map-measurement/style.css';
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
