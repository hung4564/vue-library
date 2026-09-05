---
category: Component
---

# DraggableItemSideBar

## Overview

`DraggableItemSideBar` creates a sidebar panel that can be dragged and expanded/collapsed. It is ideal for navigation menus or tool panels that need to be shown or hidden dynamically and repositioned by the user.

Only one sidebar is visible per edge. If several sidebars share the same `location`, the active panel shows a **menu button** to switch between them.

## Props

| Prop             | Description                                         | Type            | Required | Default Value |
| ---------------- | --------------------------------------------------- | --------------- | -------- | ------------- |
| `show`           | Controls the visibility of the sidebar.             | `boolean`       | false    | false         |
| `expand`         | Whether the sidebar is expanded.                    | `boolean`       | false    | false         |
| `width`          | Width of the sidebar.                               | `number,string` | false    | 'auto'        |
| `location`       | Sidebar position: 'left', 'right', 'top', 'bottom'. | `string`        | false    | 'left'        |
| `title`          | Title displayed in the sidebar header.              | `string`        | false    | -             |
| `disabledExpand` | Disables the expand/collapse feature.               | `boolean`       | false    | false         |
| `disabledHeader` | Hides the header section.                           | `boolean`       | false    | false         |
| `disabledClose`  | Hides the close button.                             | `boolean`       | false    | false         |
| `containerId`    | ID of the parent container (for teleporting).       | `string`        | false    | -             |

## Events

| Name            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `update:expand` | Emitted when the expand state changes. Payload: `(value:boolean)` |
| `close`         | Emitted when the sidebar is closed. Payload: `()`                 |
| `update:show`   | Emitted when the visibility changes. Payload: `(value:boolean)`   |

React: use `onUpdateShow` / `onUpdateExpand` / `onClose`.

## Slots

| Name        | Description                         |
| ----------- | ----------------------------------- |
| `default`   | Content of the sidebar.             |
| `title`     | Custom content for the header area. |
| `extra-btn` | Extra buttons in the header.        |

## Usage

### Vue

```vue
<script setup lang="ts">
import { DraggableContainer, DraggableItemSideBar } from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemSideBar title="Title" show location="right">
      <div style="height: 100vh"></div>
    </DraggableItemSideBar>
  </DraggableContainer>
</template>
```

### React

```tsx
import { DraggableContainer, DraggableItemSideBar } from '@hungpvq/react-draggable';

export function Example() {
  return (
    <DraggableContainer>
      <DraggableItemSideBar title="Title" show location="right">
        <div style={{ height: '100vh' }} />
      </DraggableItemSideBar>
    </DraggableContainer>
  );
}
```
