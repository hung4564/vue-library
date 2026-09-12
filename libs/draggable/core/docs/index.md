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

## Styles

Import CSS once at the app entry (e.g. `main.ts` / `main.tsx`):

### Vue

```ts
import '@hungpvq/vue-draggable/style.css';
```

### React

```ts
import '@hungpvq/react-draggable/style.css';
```

Or import the shared core styles directly:

```ts
import '@hungpvq/draggable/style.css';
```

You only need one of the above. Prefer the framework package (`vue-draggable` / `react-draggable`) so wrapper-specific CSS (e.g. Vue Draggable Resizable) is included.

## Live demos

- [Vue](https://hung4564.github.io/demo-draggable/vue/)
- [React](https://hung4564.github.io/demo-draggable/react/)

## Usage

### Vue — basic example

```vue
<script setup lang="ts">
import '@hungpvq/vue-draggable/style.css';
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
import '@hungpvq/react-draggable/style.css';
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

Visibility updates differ by framework: Vue uses `v-model:show` / `@update:show`; React uses `show` + `onUpdateShow`. Prefer controlled `show` so store-driven open/close (ManagementControl, `useDragCommands`) stays in sync with the parent.

### Stable item id + commands

Pass optional `id` on any item so remounts and imperative APIs share the same store key:

```ts
import { useDragCommands } from '@hungpvq/vue-draggable'; // or react-draggable

const cmds = useDragCommands('my-container');
cmds.open('layers');
cmds.setFront('layers');
cmds.close('layers');
```

Popup / modal emit `update:bounds` (React: `onBoundsChange`) on drag/resize **stop**. Drawer already has `update:size`.

Theme tokens: [css-tokens.md](./css-tokens.md).

## FAQ

### Why is my draggable item not visible?

- Ensure the `show` prop is set to `true` (and bind `v-model:show` / `onUpdateShow` if something else can close it).
- Check container and item z-index and overflow settings.

### How do I render outside the default tree?

- Pass `containerId` and use Vue `<Teleport>` or React portals targeting the container / modal layer nodes.

### Shared styles

- Import styles at the app root — see [Styles](#styles).
- UI CSS lives in `@hungpvq/draggable`; the Vue/React packages re-export it via `/style.css`.
- Override `--draggable-*` (or `--map-*`) — see [css-tokens.md](./css-tokens.md).

### Why does the React demo say a named export is missing?

Workspace demos resolve packages to `libs/**/src`. If `@vitejs/plugin-react` Fast Refresh runs on those files, the browser can report `does not provide an export named '…'`. Exclude `libs/` from the React plugin (already done for `demo-draggable` / `demo-map`). See [SemVer §7](../../README.md#7-reducing-everything-is-breaking).

## Stable API & SemVer

- [Stable API allowlist](./stable-api.md) (named exports + `public-api.spec.ts` lock; layout persist cookbook)
- [Accessibility](./a11y.md) (modal focus trap, menu typeahead, ARIA regions)
- [CSS tokens](./css-tokens.md) (`variant="plain"`, radius/shadow/mask tokens)
- [Testing](./testing.md) (`draggable:test`, public-api locks)
- [SemVer / breaking checklist](../../README.md#checklist-semver--breaking-change)

Current line: **`<!-- docs-ver:draggable.line -->1.1.x<!-- /docs-ver:draggable.line -->`** (fixed release group for core + Vue + React adapters).

**Next minor (prep):** [releases/v1.2.md](./releases/v1.2.md) — peer matrix `~1.2.0`, migration, release-day checklist. Index: [releases/](./releases/).

## Components

- [DraggableContainer](./draggable-container.md)
- [DraggableItemBottom](./draggable-item-bottom.md)
- [DraggableItemPopup](./draggable-item-popup.md)
- [DraggableItemSideBar](./draggable-item-sidebar.md)
- [DraggableItemFloat](./draggable-item-float.md)
- [DraggableModal](./draggable-modal.md)
- [DraggableDrawer](./draggable-drawer.md)
- [ContextMenu / ContextMenuItem](./context-menu.md) (experimental)

## Contributing

Any contribution to the code or any part of the documentation and any idea and/or suggestion are very welcome.
