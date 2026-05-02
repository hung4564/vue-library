# Draggable

## Introduction

The `@hungpvq/vue-draggable` library provides a set of flexible, composable Vue components for building draggable panels, sidebars, popups, and floating UI elements. These components are designed to be easy to use, highly customizable, and suitable for a wide range of use cases in modern web applications.

## Install

```
npm i @hungpvq/vue-draggable
```

```
yarn add @hungpvq/vue-draggable
```

## Usage

### Basic Example

```vue
<script setup lang="ts">
import { DraggableContainer, DraggableItemSideBar, DraggableItemPopup, DraggableItemFloat } from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemSideBar show title="Sidebar 1">
      <div style="height: 100vh">Sidebar Content</div>
    </DraggableItemSideBar>
    <DraggableItemPopup show title="Popup 1" :top="10" :right="10">
      <div style="height: 100vh">Popup Content</div>
    </DraggableItemPopup>
    <DraggableItemFloat show title="Float 1" :right="10" :bottom="10" :width="400" headerLocation="bottom">
      <div style="height: 100vh">Float Content</div>
    </DraggableItemFloat>
  </DraggableContainer>
</template>
```

### Advanced Example: Teleporting a Popup

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
    <DraggableItemPopup show title="Teleported Popup" :top="20" :left="300" :containerId="containerId">
      <div style="height: 100px">Teleported Popup Content</div>
    </DraggableItemPopup>
  </Teleport>
</template>
```

### Example: Dynamic List of Draggable Popups

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { DraggableContainer, DraggableItemPopup } from '@hungpvq/vue-draggable';
const popups = ref([
  { id: 1, title: 'Popup 1', top: 10, left: 10 },
  { id: 2, title: 'Popup 2', top: 120, left: 120 },
]);
</script>

<template>
  <DraggableContainer>
    <DraggableItemPopup v-for="popup in popups" :key="popup.id" :show="true" :title="popup.title" :top="popup.top" :left="popup.left">
      <div>Content for {{ popup.title }}</div>
    </DraggableItemPopup>
  </DraggableContainer>
</template>
<style>
body,
html,
#root,
#app {
  height: 100%;
}
html {
  height: 100%;
  position: relative;
  overflow: hidden !important;
}

body {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
```

## FAQ

### Why is my draggable item not visible?

- Ensure the `show` prop is set to `true`.
- Check container and item z-index and overflow settings.

### How do I teleport a draggable item outside the container?

- Use the `containerId` prop and Vue's `<Teleport>` as shown in the advanced usage example.

### How can I handle many draggable items efficiently?

- Use `v-for` to render items and manage their state in a parent component.
- Avoid unnecessary re-renders by using `:key` and Vue's reactivity best practices.

## Components

- [DraggableContainer](./draggable-container.md)
- [DraggableItemBottom](./draggable-item-bottom.md)
- [DraggableItemPopup](./draggable-item-popup.md)
- [DraggableItemSideBar](./draggable-item-sidebar.md)
- [DraggableItemFloat](./draggable-item-float.md)

## Contributing

Any contribution to the code or any part of the documentation and any idea and/or suggestion are very welcome.
