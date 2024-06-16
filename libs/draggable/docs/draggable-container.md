---
category: Component
---

# DraggableContainer

<FunctionInfo fn="DraggableContainer" />

## Props

| Prop          | Description | Type     | Required | Default Value |
| ------------- | ----------- | -------- | -------- | ------------- |
| `containerId` |             | `string` | `fasle`  |               |

## Events

| Name    | Description             |
| ------- | ----------------------- |
| init    | `({id:String}) => void` |
| destroy | `({id:String}) => void` |

## Slots

| Name      | Description |
| --------- | ----------- |
| `default` |             |

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
