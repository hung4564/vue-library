# Event System in Dataset Components

## Overview

The event system allows dataset components (including custom leaves) to emit and listen for custom events. This enables decoupled communication and flexible extension of dataset behavior.

## Use Cases

- Reacting to user actions (e.g., selection, editing, custom menu clicks)
- Integrating with UI components or external systems
- Triggering side effects or workflows in response to dataset changes

## API

You can create an event system for your dataset component using `createWithEventHelper`. The returned object provides the following methods:

- `emit(eventName, data)`: Emit an event with optional data
- `on(eventName, handler)`: Listen for an event
- `off(eventName, handler?)`: Remove a specific handler or all handlers for an event

## Typing Events

You can type your event system for better type safety. Import the event type definition from the relevant file (e.g., `EventIListViewUI` for list view events).

```typescript
import { createWithEventHelper } from '@hungpvq/vue-map-dataset';
import type { EventIListViewUI } from '@hungpvq/vue-map-dataset/src/model/list-view/types';

const event = createWithEventHelper<EventIListViewUI>();
```

## Basic Usage Example

```typescript
const event = createWithEventHelper();

event.on('customEvent', (data) => {
  // Handle event
});

event.emit('customEvent', { foo: 123 });

event.off('customEvent'); // Remove all handlers for 'customEvent'
```

## Example: Using Events in a Custom Leaf

```typescript
import { createDatasetLeaf, createWithEventHelper } from '@hungpvq/vue-map-dataset';
import type { EventIListViewUI } from '@hungpvq/vue-map-dataset/src/model/list-view/types';

const event = createWithEventHelper<EventIListViewUI>();

const customLeaf = {
  ...createDatasetLeaf('My Custom Leaf'),
  type: 'my-custom-type',
  event,
};

customLeaf.event.on('customEvent', (data) => {
  // Handle custom event
});

customLeaf.event.emit('customEvent', { foo: 123 });
```

## Where to Find Event Type Definitions

- For built-in components, event type definitions are usually found in the `src/model/<component>/types.ts` files (e.g., `list-view/types.ts`).
- For custom leaves, you can define your own event type interface.

## Best Practices

- Use clear and descriptive event names
- Type your events for better safety and autocompletion
- Remove event listeners when they are no longer needed to avoid memory leaks
- Document custom events in your component's documentation
