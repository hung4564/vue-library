<script lang="ts">
export default {
  name: 'event-management-control',
};
</script>

<script setup lang="ts">
import {
  EVENT_CONTROL_LOCALE,
  MittTypeMapEventEventKey,
  type IEvent,
  type MittTypeMapEvent,
  type WithMapPropType,
} from '@hungpvq/map-core';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import { mdiCalendarSearch } from '@mdi/js';
import { computed, onMounted, onUnmounted, shallowRef } from 'vue';
import MapCommonButton from '../../../components/MapCommonButton.vue';
import {
  defaultMapProps,
  useMap,
  useShow,
  WithShowProps,
} from '../../../hooks';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useLang } from '../../lang';
import { useMapMittStore } from '../../mitt';
import { useToolbarControl } from '../../toolbar';
import { useEventMapItems } from '../hook/useEventMapItems';
import { MapEventStore } from '../store';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
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
setLocaleDefault(EVENT_CONTROL_LOCALE);
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
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapEventManagementControl',
  getState() {
    return {
      title: trans.value('map.event-control.title'),
      icon: {
        type: 'mdi',
        path: path.icon,
      },
    };
  },
  onClick() {
    toggleShow();
  },
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton
        v-if="state"
        :option="state"
        @click.stop="control.onAction"
      >
      </MapCommonButton>
    </template>

    <template #draggable="props">
      <DraggableItemSideBar
        :containerId="props.containerId"
        v-model:show="show"
        :title="trans('map.event-control.title')"
      >
        <template #title> {{ trans('map.event-control.title') }} </template>
        <div class="map-event-control">
          <div
            v-for="(group, type) in groupedViews"
            :key="type"
            class="map-event-control__group"
          >
            <h2 class="map-event-control__group-title">{{ type }}</h2>
            <ul class="map-event-control__list">
              <li
                v-for="event in group"
                :key="event.id"
                :class="[
                  'map-event-control__item',
                  { 'is-active': isActive(current, event) },
                ]"
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
                  <strong>{{ trans('map.event-control.field.from') }}:</strong>
                  {{ event.from || 'N/A' }}
                </div>
                <div class="map-event-control__status">
                  <span
                    v-if="isActive(current, event)"
                    class="map-event-control__status-icon is-active"
                    >✔ Đang kích hoạt</span
                  >
                  <span v-else class="map-event-control__status-icon is-inactive"
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
