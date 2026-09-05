# Identify Control

Click or box-select features. Results use menus defined on the identify dataset node.

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `show` | `boolean` | — | Open the results panel |
| `immediately` | `boolean` | `false` | Start click-identify on mount |

## Slots

None.

## Events

None. Feature actions are identify-node menus. Mount [`ComponentManagementControl`](./ComponentManagementControl.md) so Show detail / Style can open.

## Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import {
  IdentifyControl,
  ComponentManagementControl,
  LayerHighlight,
} from '@hungpvq/vue-map-dataset';
import '@hungpvq/vue-map-core/style.css';
import '@hungpvq/vue-map-dataset/style.css';
</script>

<template>
  <Map>
    <IdentifyControl position="top-right" show />
    <LayerHighlight enable-click />
    <ComponentManagementControl />
  </Map>
</template>
```

Immediate click mode:

```vue
<IdentifyControl position="top-right" immediately />
```

## React

```tsx
<IdentifyControl position="top-right" show />
<LayerHighlight enableClick />
<ComponentManagementControl />
```

Immediate click mode: `<IdentifyControl position="top-right" immediately />`.

Identify menus are defined on the identify dataset node. See [Identify](../create-dataset/identify.md).

Right-click **Quick analysis → Identify features** (`MapContextMenuControl`) runs the same query and opens this panel. That menu item is added only when `IdentifyControl` is mounted.
