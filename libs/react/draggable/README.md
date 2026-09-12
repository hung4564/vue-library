# `@hungpvq/react-draggable`

React 18 adapter for `@hungpvq/draggable` (**1.1.x**).

## Install

```bash
npm install @hungpvq/react-draggable
```

Peers: `react` / `react-dom` `^18`, `@hungpvq/draggable@~1.1.0`, `react-rnd`, plus shared packages listed in `package.json`.

## Styles

```ts
import '@hungpvq/react-draggable/style.css';
```

## Usage

```tsx
import '@hungpvq/react-draggable/style.css';
import {
  DraggableContainer,
  DraggableItemFloat,
  DraggableModal,
} from '@hungpvq/react-draggable';

function App() {
  return (
    <DraggableContainer>
      <DraggableItemFloat title="My Panel" show>
        <p>Content here</p>
      </DraggableItemFloat>
      <DraggableModal title="Dialog" show width={480} height={280}>
        <p>Modal body</p>
      </DraggableModal>
    </DraggableContainer>
  );
}
```

Prefer controlled `show` + `onUpdateShow` so store-driven open/close stays in sync.

## Stable shells

| Component | Role |
|-----------|------|
| `DraggableContainer` | Root; optional `variant="plain"`, `mobileBreakpoint` |
| `DraggableItemFloat` / `Popup` / `Modal` | Free panels |
| `DraggableItemSideBar` / `DraggableDrawer` | Edge panels |
| `DraggableItemBottom` | Exclusive bottom sheet |

Store / commands: `useDragStore`, `useDragCommands`, `useDragLayout` (re-exported after React `configureDragStore`). Types/factories: import from `@hungpvq/draggable`.

## Differences from Vue

1. Reactivity via `@hungpvq/shared-store/react` (`useStoreReactive` / `useContainerReactive`)
2. `ContainerProvider` / `useContainerId` instead of provide/inject
3. Portals instead of Teleport
4. Icons: `@mdi/react`
5. Drag/resize peer: **`react-rnd`** (not `vue-draggable-resizable`)

`useStoreReactive` is exported from the package root / `store/useStoreReactive.ts` — do **not** re-export it from `store/index.ts` (circular barrel).

## Docs

- Hub: [docs/index.md](../../draggable/core/docs/index.md)
- [Stable API](../../draggable/core/docs/stable-api.md) · [a11y](../../draggable/core/docs/a11y.md) · [testing](../../draggable/core/docs/testing.md)
- SemVer: [libs/draggable/README.md](../../draggable/README.md)

**Vite / monorepo:** apps that path-alias this package to `libs/` must exclude `libs/` from `@vitejs/plugin-react` Fast Refresh or named exports break in the browser. See `apps/react/demo-draggable/vite.config.ts` and skill `draggable-semver-api`.

Internal chrome (`DragButton`, …) is **not** a public export.

## Tests

```bash
npx nx test @hungpvq/react-draggable
# or
npm run draggable:test
```
