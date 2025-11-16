# Extra Event

## useEventMap

```ts
const { add: addEventClick, remove: removeEventClick } = useEventMap(mapId.value, new EventClick().setHandler(onMapClick));
```

## Model

```ts
import { EventClick, EventBboxSelect } from '@hungpvq/vue-map-core';
```

- EventClick
- EventBboxSelect
- EventMouseMove

---

## How to Use Store, Hook, and Events

### 1. Using the Store

The event store manages the state of events for each map instance. You can access the store to get or set the current event, or to manage the list of events.

**Import:**

```ts
import { useMapEventStore } from '@hungpvq/vue-map-core';
```

**Example:**

```ts
const store = useMapEventStore(mapId);
// Access current event
console.info(store.current);
// Access all event items
console.info(store.items);
```

### 2. Using the Hook (`useEventMap`)

The `useEventMap` hook provides a convenient way to add, remove, and check the status of events on a map.

**Import:**

```ts
import { useEventMap } from '@hungpvq/vue-map-core';
import { EventClick } from '@hungpvq/vue-map-core';
```

**Usage:**

```ts
const { add: addEventClick, remove: removeEventClick, isActive } = useEventMap(mapId, new EventClick().setHandler(onMapClick));

// Add the event to the map
addEventClick();

// Remove the event from the map
removeEventClick();

// Check if the event is currently active
console.info(isActive.value);
```

### 3. Available Events

You can use several built-in event models provided by the library:

**Import:**

```ts
import { EventClick, EventBboxSelect, EventMouseMove } from '@hungpvq/vue-map-core';
```

**Available Events:**

- `EventClick`
- `EventBboxSelect`
- `EventMouseMove`

Each event can be instantiated and assigned a handler function using `.setHandler(fn)`.

### 4. Creating a Custom Event

You can create your own custom event by extending the base event class or by following the event interface.

**Example:**

```ts
import { IEvent } from '@hungpvq/vue-map-core';

class CustomEvent implements IEvent {
  id = 'custom-event';
  name = 'Custom Event';
  from?: string;
  handler?: (e: any) => void;

  setHandler(fn: (e: any) => void) {
    this.handler = fn;
    return this;
  }
}

// Usage with the hook
const { add, remove } = useEventMap(
  mapId,
  new CustomEvent().setHandler((e) => {
    // Custom event logic here
    console.info('Custom event triggered', e);
  }),
);

add();
```

---

#### Summary

- Use `useMapEventStore` for direct access to the event store (current event, event list).
- Use `useEventMap` for adding, removing, and checking the status of events in a component-friendly way.
- Use built-in events like `EventClick`, `EventBboxSelect`, and `EventMouseMove` for common interactions.
- Create custom events by implementing the `IEvent` interface or extending a base event class, and register them with the hook.
