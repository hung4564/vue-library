# Identify Show First Control

On map click, identifies the first hit and runs the identify resolver (default: show-detail / attribute-table when available). No toolbar button. Needs identify nodes on the dataset (see [Identify](../create-dataset/identify.md)).

## Props

<!--@include: ../../core/module/props.md-->

| Prop | Type | Default | Effect |
| --- | --- | --- | --- |
| `preferResultControl` | `boolean` | `false` | Use Identify Result panel instead of auto detail/table (requires [`IdentifyControl`](./IdentifyControl.md) / result panel on the map) |

**Events:** none.

## Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import {
  IdentifyShowFirstControl,
  ComponentManagementControl,
} from '@hungpvq/vue-map-dataset';
</script>

<template>
  <Map>
    <IdentifyShowFirstControl />
    <ComponentManagementControl />
  </Map>
</template>
```

Prefer result panel:

```vue
<IdentifyControl position="top-right" prefer-result-control />
<!-- or with ShowFirst + IdentifyControl mounted together -->
```

## React

```tsx
<IdentifyShowFirstControl />
<ComponentManagementControl />
```
