---
category: Component
---

# DraggableContainer

## Overview

`DraggableContainer` is the root component that manages the context for all draggable items. It provides boundaries and event coordination for its children, ensuring that draggable items behave consistently and do not escape their intended area.

## Props

| Prop          | Description                                                                               | Type     | Required | Default Value |
| ------------- | ----------------------------------------------------------------------------------------- | -------- | -------- | ------------- |
| `containerId` | Unique identifier for the container. Useful when teleporting items outside the container. | `string` | false    | -             |

## Events

| Name         | Description                                                                                    |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `init`       | Emitted when the container is initialized. Payload: `{id: string}`                             |
| `destroy`    | Emitted when the container is destroyed. Payload: `{id: string}`                               |
| `changeShow` | Emitted when the visibility of items changes. Payload: `{show: ResultShow; idsShow: string[]}` |

## Slots

| Name      | Description               |
| --------- | ------------------------- |
| `default` | Slot for draggable items. |

## Best Practices

- Always wrap draggable items inside a `DraggableContainer` to ensure correct event handling and boundary management.
- Use unique `containerId` values if you have multiple containers on the same page.
- Listen to the `init` and `destroy` events to manage container lifecycle if you need advanced control.

## Usage

```vue
<script setup lang="ts">
import { DraggableContainer, DraggableItemPopup, DraggableItemSideBar } from '@hungpvq/vue-draggable';
import { ref } from 'vue';
const containerId = ref('');
function init(id) {
  containerId.value = id;
}
</script>

<template>
  <DraggableContainer containerId="test" @init="init">
    <DraggableItemSideBar show title="sidebar 1">
      <div style="height: 100vh"></div>
    </DraggableItemSideBar>
  </DraggableContainer>
  <!-- or -->
  <Teleport :to="`#${containerId}`" v-if="containerId">
    <DraggableItemPopup show title="Popup 2 is outside the container" :top="10" :left="410" :containerId="containerId">
      <div style="height: 100vh"></div>
    </DraggableItemPopup>
  </Teleport>
</template>
```
