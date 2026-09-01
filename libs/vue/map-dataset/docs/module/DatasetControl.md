# Dataset Control

Sidebar of root datasets: open detail, remove a dataset.

Does **not** emit Vue/React events. Detail UI is opened through `ComponentManagementControl` (`dataset-detail`).

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
import { DatasetControl, ComponentManagementControl } from '@hungpvq/vue-map-dataset';
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
