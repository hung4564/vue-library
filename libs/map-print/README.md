# Getting start

## Install

```
npm i @hungpvq/vue-map-print
```

```
yarn add @hungpvq/vue-map-print
```

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
import { PrintAdvancedControl, PrintControl } from '@hungpvq/vue-map-print';
import '@hungpvq/vue-map-print/style.css';
</script>

<template>
  <Map>
    <PrintAdvancedControl />
    <PrintControl />
  </Map>
</template>
```

## Component

<!--@include: ./src/modules/PrintControl.md -->
<!--@include: ./src/modules/PrintAdvancedControl.md -->
