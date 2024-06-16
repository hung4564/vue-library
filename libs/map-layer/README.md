# Getting start

## Install

```
npm i @hungpvq/vue-map-layer
```

```
yarn add @hungpvq/vue-map-layer
```

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
import { LayerControl } from '@hungpvq/vue-map-layer';
import '@hungpvq/vue-map-layer/style.css';
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
