# Identify Control

Click or box-select features. Presentation uses menus on the identify dataset node and an internal resolver (detail → attribute table → result panel).

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `show` | `boolean` | — | Identify session active (toolbar) |
| `immediately` | `boolean` | `false` | Start click-identify on mount |
| `preferResultControl` | `boolean` | `false` | Always open the Identify Result panel; skip auto show-detail / attribute-table even when those menus exist. Same flag can be set per identify via `.preferResultControl()` on the builder. |

## Slots

None.

## Events

None. Feature actions are identify-node menus. Mount [`ComponentManagementControl`](./ComponentManagementControl.md) so Show detail / Style can open.

## Loading and empty results

- While `getFeatures` / `getList` / `getMergedFeatures` runs, the **Identify toolbar button** shows `loading` (spinner). Map cursor may switch to `wait`.
- **Empty hits do not open** the result panel — loading simply ends (stale items are cleared).
- The result panel opens only when the resolver needs it (e.g. all layers / multiple hits / `preferResultControl`), or when no exclusive detail/table path ran. If that panel is already open, its in-panel loading state stays in sync.

Turning on identify from a **layer menu** starts click mode and sets the layer filter; it does **not** auto-open the result panel.

## Resolver (short)

1. Unless `preferResultControl`: single layer + exactly one feature + show-detail menu → open detail  
2. Else unless `preferResultControl`: single layer + attribute-table menu → open table and select rows  
3. Always update result-panel items (even if the panel stays closed)  
4. If there are hits and no exclusive UI handled them → open result panel  

Force result panel (menus still available on each row in the panel):

```vue
<IdentifyControl position="top-right" prefer-result-control />
```

```tsx
<IdentifyControl position="top-right" preferResultControl />
```

See [Identify](../create-dataset/identify.md) for `getList` / merge APIs and `singleLayer`.

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

Right-click **Quick analysis → Identify features** (`MapContextMenuControl`) runs the same query. That menu item is added only when `IdentifyControl` is mounted.

`IdentifyResultControl` is mounted by `IdentifyControl` (no separate install required).
