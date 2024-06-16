<script setup lang="ts">
import { groupBy } from 'lodash';
import { computed, watch } from 'vue';

import { useMap, withMapProps } from '../../../hooks';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { getStore } from '../../../store';
import { KEY, MapEventStore, setCurrentEvent } from '../store';
import { IEvent } from '../types';
const props = defineProps({
  ...withMapProps,
});
const { callMap, mapId, moduleContainerProps } = useMap(props);
const current_listener: Record<string, IEvent | undefined> = {};
const state = getStore<MapEventStore>(mapId.value, KEY);
const events = computed(() => {
  return state.items;
});
watch(
  events,
  (value) => {
    updateEventMap(value);
  },
  { deep: true }
);
function updateEventMap(events: IEvent[]) {
  const listeners = groupBy<IEvent>(events, (event) => {
    return event.event_map_type;
  });
  const key_add: string[] = [];
  callMap((map) => {
    for (const key in listeners) {
      key_add.push(key);
      if (Object.prototype.hasOwnProperty.call(listeners, key)) {
        const events = listeners[key];
        const current = current_listener[key];
        const new_current = events[0];

        if (current && current.id === new_current.id) {
          return;
        }
        if (current) {
          current.removeFromMap(map);
        }
        current_listener[key] = new_current;
        if (new_current) {
          new_current.addToMap(map);
        }
        setCurrentEvent(mapId.value, key, new_current);
      }
    }
    for (const key in current_listener) {
      if (Object.prototype.hasOwnProperty.call(current_listener, key)) {
        const element = current_listener[key];
        if (!key_add.includes(key) && element) {
          element.removeFromMap(map);
          setCurrentEvent(mapId.value, key, undefined);
          current_listener[key] = undefined;
        }
      }
    }
  });
}
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps"></ModuleContainer>
</template>
