---
category: Component
---

# DraggableModal

## Overview

`DraggableModal` is a centered dialog with an optional mask overlay. The dialog can be dragged and resized inside the container and always stays on top of other draggable items (including drawer layout layers). When multiple modals are open, **later-opened modals stack above earlier ones**.

## Props

| Prop             | Description                                        | Type      | Required | Default Value |
| ---------------- | -------------------------------------------------- | --------- | -------- | ------------- |
| `title`          | Title displayed in the modal header.               | `string`  | false    | -             |
| `show`           | Controls the visibility of the modal.              | `boolean` | false    | false         |
| `width`          | Width of the modal.                                | `number`  | false    | 480           |
| `height`         | Height of the modal.                               | `number`  | false    | 320           |
| `top`            | Distance from the top of the container.            | `number`  | false    | -             |
| `left`           | Distance from the left of the container.           | `number`  | false    | -             |
| `bottom`         | Distance from the bottom of the container.         | `number`  | false    | -             |
| `right`          | Distance from the right of the container.          | `number`  | false    | -             |
| `center`         | Center the modal both horizontally and vertically. | `boolean` | false    | true          |
| `centerX`        | Center the modal horizontally.                     | `boolean` | false    | true          |
| `centerY`        | Center the modal vertically.                       | `boolean` | false    | true          |
| `mask`           | Shows the dimmed overlay behind the modal.         | `boolean` | false    | true          |
| `maskClosable`   | Closes the modal when the mask is clicked.         | `boolean` | false    | true          |
| `draggable`      | Allows dragging the modal by the header handle.    | `boolean` | false    | true          |
| `resizable`      | Allows resizing the modal.                         | `boolean` | false    | true          |
| `disabledHeader` | Hides the header section.                          | `boolean` | false    | false         |
| `disabledClose`  | Hides the close button.                            | `boolean` | false    | false         |
| `containerId`    | ID of the parent container (for teleporting).      | `string`  | false    | -             |

## Events

| Name          | Description                                                     |
| ------------- | --------------------------------------------------------------- |
| `close`       | Emitted when the modal is closed. Payload: `()`                 |
| `update:show` | Emitted when the visibility changes. Payload: `(value:boolean)` |

React: use `onUpdateShow` / `onClose` instead of Vue `update:*` / `close` events.

## Slots

| Name        | Description                         |
| ----------- | ----------------------------------- |
| `default`   | Content of the modal.               |
| `title`     | Custom content for the header area. |
| `extra-btn` | Extra buttons in the header.        |

## Usage

### Vue

```vue
<script setup lang="ts">
import { DraggableContainer, DraggableModal } from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableModal title="Confirm" show :width="480" :height="280">
      <div style="padding: 12px">Modal content</div>
    </DraggableModal>
  </DraggableContainer>
</template>
```

### React

```tsx
import { useState } from 'react';
import { DraggableContainer, DraggableModal } from '@hungpvq/react-draggable';

export function Example() {
  const [show, setShow] = useState(true);
  return (
    <DraggableContainer>
      <DraggableModal
        title="Confirm"
        show={show}
        onUpdateShow={setShow}
        width={480}
        height={280}
      >
        <div style={{ padding: 12 }}>Modal content</div>
      </DraggableModal>
    </DraggableContainer>
  );
}
```
