# Dataset Control

Sidebar of root datasets: open detail, remove a dataset.

Does **not** emit Vue/React events. Detail UI is opened through `ComponentManagementControl` (`dataset-detail`).

Root list rows refresh via `useMapDataset().datasetVersion` — see [useMapDataset](../helper/useMapDataset.md).

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `show` | `boolean` | — | Open the panel |

**Events:** none.

## Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import {
  DatasetControl,
  ComponentManagementControl,
} from '@hungpvq/vue-map-dataset';
import '@hungpvq/map-core/style.css';
import '@hungpvq/map-dataset/style.css';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
import '@hungpvq/vue-draggable/style.css';
</script>

<template>
  <Map>
    <DatasetControl position="top-left" show />
    <ComponentManagementControl />
  </Map>
</template>
```

## React

```tsx
<DatasetControl position="top-left" show />
<ComponentManagementControl />
```
