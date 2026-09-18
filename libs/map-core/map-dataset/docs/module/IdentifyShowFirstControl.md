# Identify Show First Control

On map click, identifies the first hit and runs the identify resolver (default: show-detail / attribute-table when available). No toolbar button. Needs identify nodes on the dataset (see [Identify](../create-dataset/identify.md)).

**Abort policy (same as Identify session):** each click aborts the previous in-flight `runIdentifyShowFirst` via `AbortController` and passes a new `requestId`. A newer click wins; aborted runs do not update the result panel. Unmount aborts and clears loading.

Hit UI follows each identify node’s `onSingle` / `onMultiple` (see [IdentifyControl](./IdentifyControl.md) resolver). Mount [`IdentifyControl`](./IdentifyControl.md) / result panel when the policy opens the result panel.

## Props

<!--@include: ../../core/module/props.md-->

No control-specific props beyond shared map props.

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

## React

```tsx
<IdentifyShowFirstControl />
<ComponentManagementControl />
```
