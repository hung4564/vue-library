# Draggable

## Introduction

`@hungpvq/draggable` is the shared core (CSS, types, store, and utils) for framework wrappers:

- `@hungpvq/vue-draggable` — Vue components and hooks
- `@hungpvq/react-draggable` — React components and hooks

Use the wrapper for your framework; both load shared styles via `@hungpvq/draggable`.

## Install

### Vue

```
npm i @hungpvq/vue-draggable
```

```
yarn add @hungpvq/vue-draggable
```

### React

```
npm i @hungpvq/react-draggable
```

```
yarn add @hungpvq/react-draggable
```

Peer: `@hungpvq/draggable` and `@hungpvq/shared-store` (pulled in by the wrappers).

## Live demos

- [Vue](https://hung4564.github.io/demo-draggable/vue/)
- [React](https://hung4564.github.io/demo-draggable/react/)

## Usage

### Vue — basic example

```vue
<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemSideBar,
  DraggableItemPopup,
  DraggableItemFloat,
  DraggableModal,
  DraggableDrawer,
} from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemSideBar show title="Sidebar 1">
      <div style="height: 100vh">Sidebar Content</div>
    </DraggableItemSideBar>
    <DraggableItemPopup show title="Popup 1" :top="10" :right="10">
      <div style="height: 100vh">Popup Content</div>
    </DraggableItemPopup>
    <DraggableItemFloat
      show
      title="Float 1"
      :right="10"
      :bottom="10"
      :width="400"
      headerLocation="bottom"
    >
      <div style="height: 100vh">Float Content</div>
    </DraggableItemFloat>
    <DraggableModal show title="Modal 1" :width="480" :height="280">
      <div style="padding: 12px">Modal Content</div>
    </DraggableModal>
    <DraggableDrawer show title="Drawer 1" location="right" :size="320">
      <div style="padding: 12px">Drawer Content</div>
    </DraggableDrawer>
  </DraggableContainer>
</template>
```

### React — basic example

```tsx
import {
  DraggableContainer,
  DraggableItemSideBar,
  DraggableItemPopup,
  DraggableItemFloat,
  DraggableModal,
  DraggableDrawer,
} from '@hungpvq/react-draggable';

export function App() {
  return (
    <DraggableContainer>
      <DraggableItemSideBar show title="Sidebar 1">
        <div style={{ height: '100vh' }}>Sidebar Content</div>
      </DraggableItemSideBar>
      <DraggableItemPopup show title="Popup 1" top={10} right={10}>
        <div style={{ height: '100vh' }}>Popup Content</div>
      </DraggableItemPopup>
      <DraggableItemFloat
        show
        title="Float 1"
        right={10}
        bottom={10}
        width={400}
        headerLocation="bottom"
      >
        <div style={{ height: '100vh' }}>Float Content</div>
      </DraggableItemFloat>
      <DraggableModal show title="Modal 1" width={480} height={280}>
        <div style={{ padding: 12 }}>Modal Content</div>
      </DraggableModal>
      <DraggableDrawer show title="Drawer 1" location="right" size={320}>
        <div style={{ padding: 12 }}>Drawer Content</div>
      </DraggableDrawer>
    </DraggableContainer>
  );
}
```

Visibility updates differ by framework: Vue uses `v-model:show` / `@update:show`; React uses `show` + `onUpdateShow`.

### Vue — teleporting a popup

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DraggableContainer, DraggableItemPopup } from '@hungpvq/vue-draggable';
const containerId = ref('my-container');
</script>

<template>
  <DraggableContainer :containerId="containerId">
    <!-- Main content here -->
  </DraggableContainer>
  <Teleport :to="`#${containerId}`">
    <DraggableItemPopup
      show
      title="Teleported Popup"
      :top="20"
      :left="300"
      :containerId="containerId"
    >
      <div style="height: 100px">Teleported Popup Content</div>
    </DraggableItemPopup>
  </Teleport>
</template>
```

## FAQ

### Why is my draggable item not visible?

- Ensure the `show` prop is set to `true`.
- Check container and item z-index and overflow settings.

### How do I render outside the default tree?

- Pass `containerId` and use Vue `<Teleport>` or React portals targeting the container / modal layer nodes.

### Shared styles

- Library UI styles live in `@hungpvq/draggable` only. Importing the Vue or React package loads them automatically.

## Components

- [DraggableContainer](./draggable-container.md)
- [DraggableItemBottom](./draggable-item-bottom.md)
- [DraggableItemPopup](./draggable-item-popup.md)
- [DraggableItemSideBar](./draggable-item-sidebar.md)
- [DraggableItemFloat](./draggable-item-float.md)
- [DraggableModal](./draggable-modal.md)
- [DraggableDrawer](./draggable-drawer.md)

## Contributing

Any contribution to the code or any part of the documentation and any idea and/or suggestion are very welcome.
