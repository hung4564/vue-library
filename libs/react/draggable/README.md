# @hungpvq/react-draggable

React version of the draggable library, converted from Vue.

## Installation

```bash
npm install @hungpvq/react-draggable
```

## Usage

```tsx
import { DraggableContainer, DraggableItemFloat } from '@hungpvq/react-draggable';

function App() {
  return (
    <DraggableContainer>
      <DraggableItemFloat title="My Panel" show={true}>
        <p>Content here</p>
      </DraggableItemFloat>
    </DraggableContainer>
  );
}
```

## Components

### DraggableContainer

Main container component that manages all draggable items.

### DraggableItemFloat

Floating draggable item that can be positioned anywhere.

### DraggableItemPopup

Popup draggable item with resize handles (requires react-draggable-resizable).

### DraggableItemSideBar

Sidebar draggable item that can be positioned on left, right, top, or bottom.

### DraggableItemBottom

Mobile-optimized bottom sheet component.

## Store

This library uses `@hungpvq/shared-store` which is framework-agnostic and works with both Vue and React:

- **Vue**: Uses `reactive()` for automatic reactivity
- **React**: Uses subscription pattern for reactivity via `useStoreReactive()` and `useContainerReactive()` hooks

The store is shared between Vue and React versions, allowing you to use the same store instance across both frameworks if needed.

## Differences from Vue Version

1. **State Management**: Uses `@hungpvq/shared-store` with subscription pattern for React reactivity
2. **Context**: Uses React Context API instead of Vue provide/inject
3. **Portals**: Uses React Portal instead of Vue Teleport
4. **Icons**: Uses @mdi/react instead of vue-material-design-icons
5. **Draggable Library**: Requires react-draggable-resizable (or similar) instead of vue-draggable-resizable

## Notes

- The store implementation uses `@hungpvq/shared-store` which supports both Vue and React
- React components automatically re-render when store changes via subscription pattern
- Store mutations trigger notifications to subscribed React components
