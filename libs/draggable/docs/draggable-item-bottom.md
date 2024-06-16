---
category: Component
---

# DraggableItemBottom

<FunctionInfo fn="DraggableItemBottom" />

## Props

| Prop             | Description | Type      | Required | Default Value |
| ---------------- | ----------- | --------- | -------- | ------------- |
| `title`          |             | `string`  | `fasle`  | --            |
| `disabledExpand` |             | `boolean` | `fasle`  | --            |
| `disabledHeader` |             | `boolean` | `fasle`  | --            |
| `disabledClose`  |             | `boolean` | `fasle`  | --            |
| `disabledOrder`  |             | `boolean` | `fasle`  | --            |
| `containerId`    |             | `string`  | `fasle`  | --            |
| `show`           |             | `boolean` | `fasle`  | false         |
| `expand`         |             | `boolean` | `fasle`  | false         |

## Events

| Name            | Description               |
| --------------- | ------------------------- |
| `update:expand` | `(value:boolean) => void` |
| `close`         | `() => void`              |
| `update:show`   | `(value:boolean) => void` |

## Slots

| Name        | Description |
| ----------- | ----------- |
| `default`   |             |
| `title`     |             |
| `extra-btn` |             |

## Usage

```vue
<script setup lang="ts">
import { DraggableContainer, DraggableItemBottom } from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemBottom title="Title" show>
      <div style="height: 100vh"></div>
    </DraggableItemBottom>
  </DraggableContainer>
</template>
```
