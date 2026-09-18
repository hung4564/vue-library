<script lang="ts">
export default {
  name: 'action-control',
};
</script>
<script setup lang="ts">
import { logHelper } from '@hungpvq/map-core';

import {
  createEventActionSync,
  MittTypeMapEvent,
  MittTypeMapEventEventKey,
  type IEvent,
} from '@hungpvq/map-core/event';
import { onMounted } from 'vue';
import type { WithMapPropType } from '@hungpvq/map-core';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { useMapMittStore } from '../../mitt';
import { useEventMapItems } from '../hook/useEventMapItems';
import { logger } from '../logger';
import { useMapEventStore } from '../store';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const { callMap, mapId } = useMap(props);
const store = useMapEventStore(mapId.value);
const emitter = useMapMittStore<MittTypeMapEvent>(mapId.value);

function setCurrentEvent(event_map_type: string, event?: IEvent) {
  logHelper(logger, mapId.value, 'store').debug(
    'setCurrentEvent',
    event_map_type,
    event,
  );
  store.current[event_map_type] = event;
  emitter.emit(MittTypeMapEventEventKey.setCurrent, event);
}

const { updateEventMap } = createEventActionSync({
  callMap,
  setCurrent: setCurrentEvent,
});

const { items } = useEventMapItems(mapId.value, {
  onChange: (value) => {
    updateEventMap(value);
  },
});
onMounted(() => {
  updateEventMap(items.value);
});
</script>
<template>
  <div></div>
</template>
