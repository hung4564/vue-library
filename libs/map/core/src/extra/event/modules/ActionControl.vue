<script setup lang="ts">
import { groupBy } from 'lodash';

import { onMounted } from 'vue';
import { useMap, withMapProps } from '../../../hooks';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useEventMapItems } from '../hook';
import { setCurrentEvent } from '../store';
import { IEvent } from '../types';
const props = defineProps({
  ...withMapProps,
});
const { callMap, mapId, moduleContainerProps } = useMap(props);
const current_listener: Record<string, Record<string, IEvent | undefined>> = {};
const { items } = useEventMapItems(mapId.value, {
  onChange: (value) => {
    updateEventMap(value);
  },
});
onMounted(() => {
  updateEventMap(items.value);
});
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
  <ModuleContainer v-bind="moduleContainerProps"></ModuleContainer>
</template>
