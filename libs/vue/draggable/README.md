# `@hungpvq/vue-draggable`

Vue 3 adapter for `@hungpvq/draggable` (**1.1.x**).

## Install

```bash
npm i @hungpvq/vue-draggable
```

Peers: `vue`, `@hungpvq/draggable@~1.1.0`, `vue-draggable-resizable`, plus shared packages listed in `package.json`.

## Styles

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
      title="Float 1"
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

Prefer controlled `v-model:show` so store-driven open/close stays in sync.

## Docs

- Hub: [docs/index.md](../../draggable/core/docs/index.md)
- [Stable API](../../draggable/core/docs/stable-api.md) · [a11y](../../draggable/core/docs/a11y.md) · [testing](../../draggable/core/docs/testing.md)
- SemVer: [libs/draggable/README.md](../../draggable/README.md)

**Public surface:** named root exports only. Experimental UI (`ManagementControl`, `ContextMenu`, …) lives in `src/experimental.ts` and is re-exported from the root for 1.x. Lock: `src/public-api.spec.ts`.

Internal chrome (`DragButton`, `DragHeader`, …) is **not** exported — use Stable shells / `componentSidebarToggle`.

## Tests

```bash
npx nx test @hungpvq/vue-draggable
# or
npm run draggable:test
```

## Contributing

When changing public exports: update `src/index.ts` / `experimental.ts`, `public-api.spec.ts`, and Stable docs together (`draggable-semver-api` skill).
