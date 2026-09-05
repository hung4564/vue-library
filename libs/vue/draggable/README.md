# Draggable

## Install

```bash
npm i @hungpvq/vue-draggable
```

```bash
yarn add @hungpvq/vue-draggable
```

## Styles

Import once at the app entry (`main.ts`):

```ts
import '@hungpvq/vue-draggable/style.css';
```

## Usage

```vue
<script setup lang="ts">
import {
  DraggableContainer,
  DraggableItemSideBar,
  DraggableItemPopup,
  DraggableItemFloat,
} from '@hungpvq/vue-draggable';
</script>

<template>
  <DraggableContainer>
    <DraggableItemSideBar show title="sidebar 1">
      <div style="height: 100vh"></div>
    </DraggableItemSideBar>

    <DraggableItemPopup show title="Popup 1" :top="10" :right="10">
      <div style="height: 100vh"></div>
    </DraggableItemPopup>
    <DraggableItemFloat
      show
      title="popup 1"
      :right="10"
      :bottom="10"
      :width="400"
      headerLocation="bottom"
    >
      <div style="height: 100vh"></div>
    </DraggableItemFloat>
  </DraggableContainer>
</template>
```

See full docs in the [Draggable documentation](../../draggable/core/docs/index.md) (or the published docs site).

## Contributing

Any contribution to the code or any part of the documentation and any idea and/or suggestion are very welcome.
