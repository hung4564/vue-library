---
category: Component
---

# DraggableItemBottom

## Overview

`DraggableItemBottom` provides a draggable panel that is anchored to the bottom of the container. It is useful for toolbars, notifications, or any content that should be accessible at the bottom and optionally draggable or expandable.

## Props

| Prop             | Description                                   | Type      | Required | Default Value |
| ---------------- | --------------------------------------------- | --------- | -------- | ------------- |
| `title`          | Title displayed in the bottom panel header.   | `string`  | false    | -             |
| `disabledExpand` | Disables the expand/collapse feature.         | `boolean` | false    | false         |
| `disabledHeader` | Hides the header section.                     | `boolean` | false    | false         |
| `disabledClose`  | Hides the close button.                       | `boolean` | false    | false         |
| `disabledOrder`  | Disables drag ordering with other items.      | `boolean` | false    | false         |
| `containerId`    | ID of the parent container (for teleporting). | `string`  | false    | -             |
| `show`           | Controls the visibility of the bottom panel.  | `boolean` | false    | false         |
| `expand`         | Whether the bottom panel is expanded.         | `boolean` | false    | false         |

## Events

| Name            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `update:expand` | Emitted when the expand state changes. Payload: `(value:boolean)` |
| `close`         | Emitted when the bottom panel is closed. Payload: `()`            |
| `update:show`   | Emitted when the visibility changes. Payload: `(value:boolean)`   |

## Slots

| Name        | Description                         |
| ----------- | ----------------------------------- |
| `default`   | Content of the bottom panel.        |
| `title`     | Custom content for the header area. |
| `extra-btn` | Extra buttons in the header.        |

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
