---
category: Extra
---

# Extra Event

<FunctionInfo fn="Extra Event" package="Map - Core" :frontmatter="$frontmatter"  />

## useEventMap

```ts
import { eventStore } from '@hungpvq/vue-map-core';

const { add: addEventClick, remove: removeEventClick } = useEventMap(mapId.value, new EventClick().setHandler(onMapClick));
```

## Store

```ts
import { eventStore, type MapEventStore ,type IEvent} from '@hungpvq/vue-map-core';
eventStore.addListenerMap(mapId: string, event: IEvent): Promise<void>
eventStore.removeListenerMap(mapId: string, event: IEvent): Promise<void>
eventStore.getCurrentEvent(mapId: string, event_map_type: string): IEvent
eventStore.setCurrentEvent(mapId: string, event_map_type: string, event?: IEvent): IEvent
```

## Model

```ts
import { EventClick, EventBboxSelect } from '@hungpvq/vue-map-core';
```

- EventClick
- EventBboxSelect
