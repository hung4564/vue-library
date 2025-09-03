# HomeControl

## Props

<!--@include: ./props.md-->

and

| Prop     | Description | Type              | Required | Default Value |
| -------- | ----------- | ----------------- | -------- | ------------- |
| `zoom`   |             | `number`          | `false`  | -             |
| `center` |             | `[number,number]` | `false`  | -             |

## Events

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` | id:string   |

## Usage

```vue
<script setup lang="ts">
import { Map, HomeControl } from '@hungpvq/vue-map-core';
import '@hungpvq/vue-map/style.css';
</script>

<template>
  <Map>
    <HomeControl />
  </Map>
</template>
```
