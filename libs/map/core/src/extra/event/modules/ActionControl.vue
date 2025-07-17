<script lang="ts">
export default {
  name: 'action-control',
};
</script>
<script setup lang="ts">
import { logHelper } from '@hungpvq/shared-map';
import { groupBy } from 'lodash';

import { onMounted } from 'vue';
import { defaultMapProps, useMap, type WithMapPropType } from '../../../hooks';
import { useMapMittStore } from '../../mitt';
import { useEventMapItems } from '../hook';
import { logger } from '../logger';
import { useMapEventStore } from '../store';
import { IEvent, MittTypeMapEvent, MittTypeMapEventEventKey } from '../types';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { callMap, mapId } = useMap(props);
const store = useMapEventStore(mapId.value);
const emitter = useMapMittStore<MittTypeMapEvent>(mapId.value);
const current_listener: Record<string, Record<string, IEvent | undefined>> = {};
const { items } = useEventMapItems(mapId.value, {
  onChange: (value) => {
    updateEventMap(value);
  },
});
onMounted(() => {
  updateEventMap(items.value);
});
function setCurrentEvent(
  mapId: string,
  event_map_type: string,
  event?: IEvent,
) {
  logHelper(logger, mapId, 'store').debug(
    'setCurrentEvent',
    event_map_type,
    event,
  );
  store.current[event_map_type] = event;
  emitter.emit(MittTypeMapEventEventKey.setCurrent, event);
}
function updateEventMap(events: IEvent[]) {
  const listeners = groupBy<IEvent>(events, (event) => {
    return event.event_map_type;
  });
  callMap((map) => {
    const key_add: string[] = [];
    if (!current_listener[map.id]) {
      current_listener[map.id] = {};
    }
    for (const key in listeners) {
      key_add.push(key);
      if (Object.prototype.hasOwnProperty.call(listeners, key)) {
        const events = listeners[key];
        const current = current_listener[map.id][key];
        const new_current = events[0];

        if (current && current.id === new_current.id) {
          return;
        }
        if (current) {
          current.removeFromMap(map);
        }
        current_listener[map.id][key] = new_current;
        if (new_current) {
          new_current.addToMap(map);
        }
        setCurrentEvent(mapId.value, key, new_current);
      }
    }
    for (const key in current_listener[map.id]) {
      if (Object.prototype.hasOwnProperty.call(current_listener[map.id], key)) {
        const element = current_listener[map.id][key];
        if (!key_add.includes(key) && element) {
          element.removeFromMap(map);
          setCurrentEvent(mapId.value, key, undefined);
          current_listener[map.id][key] = undefined;
        }
      }
    }
  });
}
</script>
<template>
  <div></div>
</template>
