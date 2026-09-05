---
category: Component
---

# DraggableDrawer

## Overview

`DraggableDrawer` is a **layout layer** docked to an edge (`left`, `right`, `top`, `bottom`). Unlike sidebar/popup overlays, it occupies grid space around the center container and shrinks the center area instead of stacking on top of it.

```
┌────────── top ──────────┐
│ left │  container │ right │
└───────── bottom ────────┘
```

Its length (width for left/right, height for top/bottom) can be resized by dragging the free edge.

Only one drawer is visible per edge. If several drawers share the same `location`, the active drawer shows a **menu button** (like sidebar) to switch between them — there is no z-order bring-forward/send-back control.

## Props

| Prop             | Description                                         | Type      | Required | Default Value |
| ---------------- | --------------------------------------------------- | --------- | -------- | ------------- |
| `show`           | Controls the visibility of the drawer layer.        | `boolean` | false    | false         |
| `location`       | Drawer edge: `left`, `right`, `top`, `bottom`.      | `string`  | false    | `'right'`     |
| `size`           | Drawer length in pixels.                            | `number`  | false    | 360           |
| `minSize`        | Minimum resizable length.                           | `number`  | false    | 200           |
| `maxSize`        | Maximum resizable length.                           | `number`  | false    | -             |
| `resizable`      | Enables resizing along the free edge.               | `boolean` | false    | true          |
| `title`          | Title displayed in the drawer header / switch menu. | `string`  | false    | -             |
| `disabledHeader` | Hides the header section.                           | `boolean` | false    | false         |
| `disabledClose`  | Hides the close button.                             | `boolean` | false    | false         |
| `containerId`    | ID of the parent container (for teleporting).       | `string`  | false    | -             |

## Events

| Name            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `update:size`   | Emitted when the drawer size changes. Payload: `(value:number)`   |
| `resize`        | Emitted while resizing. Payload: `(value:number)`                 |
| `close`         | Emitted when the drawer is closed. Payload: `()`                  |
| `update:show`   | Emitted when the visibility changes. Payload: `(value:boolean)`   |

React: use `onUpdateSize` / `onUpdateShow` / `onClose` instead of Vue `update:*` / `close` events.

## Usage

### Vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DraggableContainer, DraggableDrawer } from '@hungpvq/vue-draggable';
const size = ref(360);
</script>

<template>
  <DraggableContainer>
    <DraggableDrawer
      title="Filters"
      show
      location="right"
      v-model:size="size"
      :min-size="240"
      :max-size="640"
    >
      <div style="padding: 12px">Drawer content (size: {{ size }}px)</div>
    </DraggableDrawer>
    <DraggableDrawer title="Layers" location="right" :show="false">
      <div style="padding: 12px">Switch via the header menu</div>
    </DraggableDrawer>
  </DraggableContainer>
</template>
```

### React

```tsx
import { useState } from 'react';
import { DraggableContainer, DraggableDrawer } from '@hungpvq/react-draggable';

export function Example() {
  const [size, setSize] = useState(360);
  return (
    <DraggableContainer>
      <DraggableDrawer
        title="Filters"
        show
        location="right"
        size={size}
        onUpdateSize={setSize}
        minSize={240}
        maxSize={640}
      >
        <div style={{ padding: 12 }}>Drawer content (size: {size}px)</div>
      </DraggableDrawer>
      <DraggableDrawer title="Layers" location="right" show={false}>
        <div style={{ padding: 12 }}>Switch via the header menu</div>
      </DraggableDrawer>
    </DraggableContainer>
  );
}
```
