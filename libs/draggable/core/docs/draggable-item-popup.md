---
category: Component
---

# DraggableItemPopup

## Overview

`DraggableItemPopup` provides a draggable popup window that can be positioned anywhere within the container. It is suitable for dialogs, notifications, or any floating content that needs to be moved by the user.

## Props

| Prop             | Description                                        | Type      | Required | Default Value |
| ---------------- | -------------------------------------------------- | --------- | -------- | ------------- |
| `id`             | Stable item id for store commands / remount.       | `string`  | false    | auto UUID     |
| `title`          | Title displayed in the popup header.               | `string`  | false    | -             |
| `disabledExpand` | Disables the expand/collapse feature.              | `boolean` | false    | false         |
| `disabledHeader` | Hides the header section.                          | `boolean` | false    | false         |
| `disabledClose`  | Hides the close button.                            | `boolean` | false    | false         |
| `disabledOrder`  | Disables drag ordering with other items.           | `boolean` | false    | false         |
| `highlightMs`    | How long highlight stays on (ms).                  | `number`  | false    | `5000`        |
| `containerId`    | ID of the parent container (for teleporting).      | `string`  | false    | -             |
| `show`           | Controls the visibility of the popup.              | `boolean` | false    | false         |
| `expand`         | Whether the popup is expanded.                     | `boolean` | false    | false         |
| `width`          | Width of the popup.                                | `number`  | false    | 200           |
| `height`         | Height of the popup.                               | `number`  | false    | 200           |
| `top`            | Distance from the top of the container.            | `number`  | false    | -             |
| `left`           | Distance from the left of the container.           | `number`  | false    | -             |
| `bottom`         | Distance from the bottom of the container.         | `number`  | false    | -             |
| `right`          | Distance from the right of the container.          | `number`  | false    | -             |
| `centerX`        | Center the popup horizontally.                     | `boolean` | false    | false         |
| `centerY`        | Center the popup vertically.                       | `boolean` | false    | false         |
| `center`         | Center the popup both horizontally and vertically. | `boolean` | false    | false         |

## Events

| Name            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `update:expand` | Emitted when the expand state changes. Payload: `(value:boolean)` |
| `close`         | Emitted when the popup is closed. Payload: `()`                   |
| `update:show`   | Emitted when the visibility changes. Payload: `(value:boolean)`   |
| `update:bounds` | Emitted on drag/resize stop. Payload: `{x,y,width,height}`        |

React: use `onUpdateShow` / `onUpdateExpand` / `onClose` / `onBoundsChange`.

Prefer `v-model:show` (Vue) or controlled `show` + `onUpdateShow` (React) so store-driven open/close stays in sync.

## Slots

| Name        | Description                         |
| ----------- | ----------------------------------- |
| `default`   | Content of the popup.               |
| `title`     | Custom content for the header area. |
| `extra-btn` | Extra buttons in the header.        |

## Usage

### Vue

```vue
<script setup lang="ts">
import { DraggableContainer, DraggableItemPopup } from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemPopup title="Title" show :top="10" :left="410" :width="300" :height="400">
      <div style="height: 100vh"></div>
    </DraggableItemPopup>
  </DraggableContainer>
</template>
```

### React

```tsx
import { DraggableContainer, DraggableItemPopup } from '@hungpvq/react-draggable';

export function Example() {
  return (
    <DraggableContainer>
      <DraggableItemPopup title="Title" show top={10} left={410} width={300} height={400}>
        <div style={{ height: '100vh' }} />
      </DraggableItemPopup>
    </DraggableContainer>
  );
}
```

## Accessibility

Non-modal `role="dialog"` + `aria-labelledby`; Escape closes when focus is inside the panel; expand uses `aria-expanded`. Icon-only chrome is labelled. Keyboard drag/resize is out of scope. See [a11y.md](./a11y.md).
