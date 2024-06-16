# Getting start

## Install

```
npm i @hungpv97/vue-map-print
```

```
yarn add @hungpv97/vue-map-print
```

## Usage

```vue
<script setup lang="ts">
import { Map } from '@hungpv97/vue-map-core';
import '@hungpv97/vue-map/style.css';
import { PrintAdvancedControl, PrintControl } from '@hungpv97/vue-map-print';
import '@hungpv97/vue-map-print/style.css';
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
