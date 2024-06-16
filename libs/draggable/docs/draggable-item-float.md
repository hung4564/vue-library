---
category: Component
---

# DraggableItemFloat

<FunctionInfo fn="DraggableItemFloat" />

## Props

| Prop             | Description       | Type      | Required | Default Value |
| ---------------- | ----------------- | --------- | -------- | ------------- |
| `title`          |                   | `string`  | `fasle`  | --            |
| `disabledExpand` |                   | `boolean` | `fasle`  | --            |
| `disabledHeader` |                   | `boolean` | `fasle`  | --            |
| `disabledClose`  |                   | `boolean` | `fasle`  | --            |
| `disabledOrder`  |                   | `boolean` | `fasle`  | --            |
| `containerId`    |                   | `string`  | `fasle`  | --            |
| `show`           |                   | `boolean` | `fasle`  | false         |
| `expand`         |                   | `boolean` | `fasle`  | false         |
| `width`          |                   | `number`  | `fasle`  | 200           |
| `height`         |                   | `number`  | `fasle`  | 200           |
| `top`            |                   | `number`  | `fasle`  | --            |
| `left`           |                   | `number`  | `fasle`  | --            |
| `bottom`         |                   | `number`  | `fasle`  | --            |
| `right`          |                   | `number`  | `fasle`  | --            |
| `maxHeight`      |                   | `number`  | `fasle`  | 500           |
| `headerLocation` | `top` or `bottom` | `string   | `fasle`  | 'top'         |

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
import { DraggableContainer, DraggableItemFloat } from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemFloat title="Title" show right :right="10" :bottom="10" :width="400">
      <div style="height: 100vh"></div>
    </DraggableItemFloat>
  </DraggableContainer>
</template>
```
