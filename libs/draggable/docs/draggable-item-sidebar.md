---
category: Component
---

# DraggableItemSideBar

<FunctionInfo fn="DraggableItemSideBar" />

## Props

| Prop             | Description | Type            | Required | Default Value |
| ---------------- | ----------- | --------------- | -------- | ------------- |
| `show`           |             | `boolean`       | `fasle`  | false         |
| `expand`         |             | `boolean`       | `fasle`  | false         |
| `width`          |             | `number,string` | `fasle`  | 'auto'        |
| `right`          |             | `boolean`       | `fasle`  | --            |
| `title`          |             | `string`        | `fasle`  | --            |
| `disabledExpand` |             | `boolean`       | `fasle`  | --            |
| `disabledHeader` |             | `boolean`       | `fasle`  | --            |
| `disabledClose`  |             | `boolean`       | `fasle`  | --            |
| `disabledOrder`  |             | `boolean`       | `fasle`  | --            |
| `containerId`    |             | `string`        | `fasle`  | --            |

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
import { DraggableContainer, DraggableItemSideBar } from '@hungpv97/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemSideBar title="Title" show right>
      <div style="height: 100vh"></div>
    </DraggableItemSideBar>
  </DraggableContainer>
</template>
```
