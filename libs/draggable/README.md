# Draggable

## Install

```
npm i @hungpvq/vue-draggable
```

```
yarn add @hungpvq/vue-draggable
```

## Usage

```vue
<script setup lang="ts">
import { DraggableContainer, DraggableItemSideBar, DraggableItemPopup, DraggableItemFloat } from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemSideBar show title="sidebar 1">
      <div style="height: 100vh"></div>
    </DraggableItemSideBar>

    <DraggableItemPopup show title="Popup 1" :top="10" :right="10">
      <div style="height: 100vh"></div>
    </DraggableItemPopup>
    <DraggableItemFloat show title="popup 1" :right="10" :bottom="10" :width="400" headerLocation="bottom">
      <div style="height: 100vh"></div>
    </DraggableItemFloat>
  </DraggableContainer>
</template>
<style>
body,
html,
#root {
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

## Components

- [draggable-container]
- [draggable-bottom]
- [draggable-popup]
- [draggable-sidebar]
- [draggable-float]

## Contributing

Any contribution to the code or any part of the documentation and any idea and/or suggestion are very welcome.
