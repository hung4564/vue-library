# Getting start

## Install

```
npm i @hungpv97/vue-map-layer
```

```
yarn add @hungpv97/vue-map-layer
```

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpv97/vue-map-core';
import '@hungpv97/vue-map/style.css';
import { LayerControl } from '@hungpv97/vue-map-layer';
import '@hungpv97/vue-map-layer/style.css';
</script>

<template>
  <Map>
    <LayerControl />
  </Map>
</template>
```

## Component

<!--@include: ./src/modules/LayerControl.md -->

<!--@include: ./src/modules/IdentifyControl/index.md -->
