# Getting start

## Install

```
npm i @hungpvq/vue-map-draw
```

```
yarn add @hungpvq/vue-map-draw
```

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
import { DrawControl } from '@hungpvq/vue-map-draw';
import '@hungpvq/vue-map-draw/style.css';
</script>

<template>
  <Map>
    <DrawControl />
  </Map>
</template>
```

## Component

<!--@include: ./src/modules/DrawControl/index.md -->

## Type

<<< ./src/types/index.ts#store

<<< ./src/types/index.ts#draw
