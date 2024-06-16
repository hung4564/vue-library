# Getting start

## Install

```
npm i @hungpv97/vue-map-draw
```

```
yarn add @hungpv97/vue-map-draw
```

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpv97/vue-map-core';
import '@hungpv97/vue-map/style.css';
import { DrawControl } from '@hungpv97/vue-map-draw';
import '@hungpv97/vue-map-draw/style.css';
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
