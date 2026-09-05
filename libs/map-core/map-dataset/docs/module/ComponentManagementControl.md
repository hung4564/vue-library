# Component Management Control

Renders overlay UI that menus open with `addComponent` (style editor, layer detail, dataset detail, attribute table, …). **Required** next to `LayerControl` / `IdentifyControl` / `DatasetControl` if those menus should show dialogs.

**Events:** none. Closing a dialog calls the store `removeComponent` internally.

## Props

<!--@include: ../../core/module/props.md-->

No extra props. `mapId` is enough (inherited from `<Map>`).

## Vue

```vue
<template>
  <Map>
    <LayerControl position="top-left" show />
    <IdentifyControl position="top-right" />
    <DatasetControl position="top-left" />
    <ComponentManagementControl />
  </Map>
</template>

<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import {
  LayerControl,
  IdentifyControl,
  DatasetControl,
  ComponentManagementControl,
} from '@hungpvq/vue-map-dataset';
</script>
```

## React

```tsx
<LayerControl position="top-left" show />
<ComponentManagementControl />
```

Needs `createDatasetRegistryPlugin()` so keys like `style-control`, `layer-detail`, `dataset-detail`, `attribute-table` resolve.
