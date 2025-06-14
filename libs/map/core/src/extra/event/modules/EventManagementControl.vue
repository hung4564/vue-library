<script lang="ts">
export default {
  name: 'event-management-control',
};
</script>

<script setup lang="ts">
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCalendarSearch } from '@mdi/js';
import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import MapControlButton from '../../../components/MapControlButton.vue';
import { makeShowProps, useMap, useShow, withMapProps } from '../../../hooks';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useLang } from '../../lang';
import { useMapMittStore } from '../../mitt';
import { useEventMapItems } from '../hook/useEventMapItems';
import { MapEventStore } from '../store';
import {
  MittTypeMapEventEventKey,
  type IEvent,
  type MittTypeMapEvent,
} from '../types';
const props = defineProps({
  ...withMapProps,
  ...makeShowProps({ show: false }),
});
const { mapId, moduleContainerProps } = useMap(props);
const { trans, setLocaleDefault } = useLang(mapId.value);
const events = shallowRef<MapEventStore['items']>([]);
const current = shallowRef<MapEventStore['current']>({});
const emitter = useMapMittStore<MittTypeMapEvent>(mapId.value);
onMounted(() => {
  emitter.on(MittTypeMapEventEventKey.setCurrent, updateCurrent);
});
onUnmounted(() => {
  emitter.off(MittTypeMapEventEventKey.setCurrent, updateCurrent);
});
const { getCurrent } = useEventMapItems(mapId.value, {
  onChange: (p_events = []) => {
    events.value = p_events.slice();
  },
});
function updateCurrent() {
  current.value = getCurrent();
}
setLocaleDefault({
  map: {
    'event-control': {
      title: 'Event Control',
      field: {
        name: 'Name',
        id: 'ID',
        from: 'From',
      },
    },
  },
});
const path = {
  icon: mdiCalendarSearch,
};
const [show, toggleShow] = useShow(props.show);
defineSlots<{
  default(): any;
}>();
function isActive(current: MapEventStore['current'], event: IEvent) {
  const currentCheck = current[event.event_map_type];
  return currentCheck && currentCheck.id === event.id;
}
const groupedViews = computed(() => {
  const groups: Record<string, IEvent[]> = {};
  for (const view of events.value) {
    const type = view.event_map_type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(view);
  }
  return groups;
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        v-if="!show"
        @click.stop="toggleShow()"
        :active="show"
        :tooltip="trans('map.dataset-control.title')"
      >
        <SvgIcon size="14" type="mdi" :path="path.icon" />
      </MapControlButton>
    </template>

    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
      >
        <template #title> {{ trans('map.event-control.title') }} </template>
        <div class="event-group-container">
          <div
            v-for="(group, type) in groupedViews"
            :key="type"
            class="event-group"
          >
            <h2 class="group-title">{{ type }}</h2>
            <ul class="event-list">
              <li
                v-for="event in group"
                :key="event.id"
                :class="['event-item', { active: isActive(current, event) }]"
              >
                <div>
                  <strong>{{ trans('map.event-control.field.id') }}:</strong>
                  {{ event.id }}
                </div>
                <div>
                  <strong>{{ trans('map.event-control.field.name') }}:</strong>
                  {{ event.name || 'N/A' }}
                </div>
                <div>
                  <strong>{{ trans('map.event-control.field.name') }}:</strong>
                  {{ event.from || 'N/A' }}
                </div>
                <div class="status">
                  <span
                    v-if="isActive(current, event)"
                    class="status-icon active"
                    >✔ Đang kích hoạt</span
                  >
                  <span v-else class="status-icon inactive"
                    >✖ Không kích hoạt</span
                  >
                </div>
              </li>
            </ul>
          </div>
        </div>
      </DraggableItemSideBar>
    </template>
    <slot />
  </ModuleContainer>
</template>
<style scoped>
.event-group-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px;
}

.group-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}

.event-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-item {
  border: 1px solid #ccc;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.event-item.active {
  border-color: var(--v-primary-base, #1a73e8);
}

.status {
  margin-top: 6px;
  font-size: 14px;
}
.status-icon.active {
  color: var(--v-primary-base, #1a73e8);
}
.status-icon {
  font-weight: bold;
}
</style>
