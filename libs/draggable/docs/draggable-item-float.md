---
category: Component
---

# DraggableItemFloat

## Overview

`DraggableItemFloat` provides a floating, draggable panel that can be positioned anywhere within the container. It is ideal for tool palettes, floating controls, or any UI element that should be freely movable and optionally docked to a side or corner.

## Props

| Prop             | Description                                   | Type      | Required | Default Value |
| ---------------- | --------------------------------------------- | --------- | -------- | ------------- |
| `title`          | Title displayed in the float header.          | `string`  | false    | -             |
| `disabledExpand` | Disables the expand/collapse feature.         | `boolean` | false    | false         |
| `disabledHeader` | Hides the header section.                     | `boolean` | false    | false         |
| `disabledClose`  | Hides the close button.                       | `boolean` | false    | false         |
| `disabledOrder`  | Disables drag ordering with other items.      | `boolean` | false    | false         |
| `containerId`    | ID of the parent container (for teleporting). | `string`  | false    | -             |
| `show`           | Controls the visibility of the float panel.   | `boolean` | false    | false         |
| `expand`         | Whether the float panel is expanded.          | `boolean` | false    | false         |
| `width`          | Width of the float panel.                     | `number`  | false    | 200           |
| `height`         | Height of the float panel.                    | `number`  | false    | 200           |
| `top`            | Distance from the top of the container.       | `number`  | false    | -             |
| `left`           | Distance from the left of the container.      | `number`  | false    | -             |
| `bottom`         | Distance from the bottom of the container.    | `number`  | false    | -             |
| `right`          | Distance from the right of the container.     | `number`  | false    | -             |
| `maxHeight`      | Maximum height of the float panel.            | `number`  | false    | 500           |
| `headerLocation` | Location of the header: 'top' or 'bottom'.    | `string`  | false    | 'top'         |

## Events

| Name            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `update:expand` | Emitted when the expand state changes. Payload: `(value:boolean)` |
| `close`         | Emitted when the float panel is closed. Payload: `()`             |
| `update:show`   | Emitted when the visibility changes. Payload: `(value:boolean)`   |

## Slots

| Name        | Description                         |
| ----------- | ----------------------------------- |
| `default`   | Content of the float panel.         |
| `title`     | Custom content for the header area. |
| `extra-btn` | Extra buttons in the header.        |

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
