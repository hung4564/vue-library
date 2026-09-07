---
category: Component
---

# DraggableItemBottom

## Overview

`DraggableItemBottom` registers a bottom-sheet panel and portals its title/content into a shared **`BottomContainer`** chrome (header, expand, close, switcher menu) mounted by `DraggableContainer`.

Only **one** bottom is visible at a time (`ContainerStore.bottom.show` is a single id). When several `DraggableItemBottom` instances are registered, the active panel shows a **menu button** to switch between them (same pattern as sidebar/drawer).

## Props

| Prop             | Description                                   | Type      | Required | Default Value |
| ---------------- | --------------------------------------------- | --------- | -------- | ------------- |
| `id`             | Stable item id for store commands / remount.  | `string`  | false    | auto UUID     |
| `title`          | Title displayed in the bottom panel header / switch menu. | `string`  | false    | -             |
| `containerId`    | ID of the parent container (for teleporting). | `string`  | false    | -             |
| `show`           | Controls whether this bottom is the active sheet. | `boolean` | false    | false         |

Legacy chrome flags (`disabledExpand`, `disabledHeader`, `disabledClose`, `expand`, …) may still appear on the component API for compatibility; expand/close live on the shared shell.

## Events

| Name            | Description                                                       |
| --------------- | ----------------------------------------------------------------- |
| `close`         | Emitted when the bottom panel is closed. Payload: `()`            |
| `update:show`   | Emitted when the visibility changes. Payload: `(value:boolean)`   |

React: use `onUpdateShow` / `onClose`.

## Slots

| Name        | Description                         |
| ----------- | ----------------------------------- |
| `default`   | Content of the bottom panel.        |
| `title`     | Custom content for the header area. |

## Store

- `bottom.items: string[]` — registered bottom ids
- `bottom.show?: string` — **exclusive** active id (breaking vs older `show: string[]`)
- Use `useBottomItem(containerId)` (`registerBottom` / `registerBottomShow` / …); do not register bottoms via `useDragItem.registerItem(..., 'item-bottom')`

## Usage

### Vue

```vue
<script setup lang="ts">
import { DraggableContainer, DraggableItemBottom } from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemBottom title="Panel A" show>
      <div>First bottom</div>
    </DraggableItemBottom>
    <DraggableItemBottom title="Panel B" :show="false">
      <div>Second bottom — switch via header menu</div>
    </DraggableItemBottom>
  </DraggableContainer>
</template>
```

### React

```tsx
import { DraggableContainer, DraggableItemBottom } from '@hungpvq/react-draggable';

export function Example() {
  return (
    <DraggableContainer>
      <DraggableItemBottom title="Panel A" show>
        <div>First bottom</div>
      </DraggableItemBottom>
      <DraggableItemBottom title="Panel B" show={false}>
        <div>Second bottom — switch via header menu</div>
      </DraggableItemBottom>
    </DraggableContainer>
  );
}
```
