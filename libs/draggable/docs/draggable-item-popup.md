---
category: Component
---

# DraggableItemPopup

<FunctionInfo fn="DraggableItemPopup" />

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
| `width`          |             | `number`  | `fasle`  | 200           |
| `height`         |             | `number`  | `fasle`  | 200           |
| `top`            |             | `number`  | `fasle`  | --            |
| `left`           |             | `number`  | `fasle`  | --            |
| `bottom`         |             | `number`  | `fasle`  | --            |
| `right`          |             | `number`  | `fasle`  | --            |
| `centerX`        |             | `boolean` | `fasle`  | --            |
| `centerY`        |             | `boolean` | `fasle`  | --            |
| `center`         |             | `boolean` | `fasle`  | --            |

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
import { DraggableContainer, DraggableItemPopup } from '@hungpv97/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemPopup title="Title" show :top="10" :left="410">
      <div style="height: 100vh"></div>
    </DraggableItemPopup>
  </DraggableContainer>
</template>
```
