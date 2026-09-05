# Layer Info Control

Read-only layer list (no create / delete / move). Same list data as `LayerControl`.

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `show` | `boolean` | — | Open the panel |

**Events:** none.

## Slots

| Name | Vue | React |
| --- | --- | --- |
| `endList` | slot `{ mapId }` | not exposed |
| `default` | extra children | — |

## Vue

```vue
<script setup lang="ts">
import { Map, BaseMapCard } from '@hungpvq/vue-map-core';
import { LayerInfoControl } from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
</script>

<template>
  <Map>
    <LayerInfoControl position="bottom-right" show>
      <template #endList="{ mapId }">
        <BaseMapCard :mapId="mapId" />
      </template>
    </LayerInfoControl>
  </Map>
</template>
```

## React

```tsx
<LayerInfoControl position="bottom-right" show />
```
