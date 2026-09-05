# Identify Show First Control

On map click, identifies features and runs the **first** menu action. No visible UI. Needs identify nodes on the dataset (see [Identify](../create-dataset/identify.md)).

## Props

<!--@include: ../../core/module/props.md-->

No extra props.

**Events:** none.

## Vue

```vue
<script setup lang="ts">
import { Map } from '@hungpvq/vue-map-core';
import { IdentifyShowFirstControl, ComponentManagementControl } from '@hungpvq/vue-map-dataset';
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
