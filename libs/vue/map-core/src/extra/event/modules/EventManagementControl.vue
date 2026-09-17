<script lang="ts">
export default {
  name: 'event-management-control',
};
</script>

<script setup lang="ts">
import { type WithMapPropType } from '@hungpvq/map-core';
import {
  EVENT_CONTROL_LOCALE,
  groupEventsByMapType,
  isEventActive,
  MittTypeMapEventEventKey,
  type IEvent,
  type MapEventStore,
  type MittTypeMapEvent,
} from '@hungpvq/map-core/event';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { DraggableItemSideBar } from '@hungpvq/vue-draggable';
import { mdiCalendarSearch } from '@mdi/js';
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue';
import MapCommonButton from '../../../components/MapCommonButton.vue';
import { defaultMapProps, useMap } from '../../../hooks/useMap';
import { useShow, type WithShowProps } from '../../../hooks/useShow';
import ModuleContainer from '../../../modules/ModuleContainer/ModuleContainer.vue';
import { useLang } from '../../lang/hook';
import { useMapMittStore } from '../../mitt';
import { useRegisterMapControl } from '../../registry/useRegisterMapControl';
import { useToolbarControl } from '../../toolbar/helper';
import { useEventMapItems } from '../hook/useEventMapItems';
const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
});
const { mapId, moduleContainerProps } = useMap(props);
const { trans, registerLocale } = useLang(mapId.value);
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
registerLocale('en', EVENT_CONTROL_LOCALE);
const path = {
  icon: mdiCalendarSearch,
};
const [show, toggleShow] = useShow(props.show);
const { panelPosition } = useRegisterMapControl(mapId, {
  id: 'mapEventManagementControl',
  panelKind: 'sidebar',
  title: () => trans.value('map.event-control.title'),
  buttonPosition: () => props.position,
  show,
  setShow: toggleShow,
  initialPanelPosition: { location: 'left' },
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
  actions: [
    {
      type: 'mapEventManagementControl',
      run: () => toggleShow(),
    },
  ],
});
defineSlots<{
  default(): any;
}>();
const groupedViews = computed(() => groupEventsByMapType(events.value));
const { state, control } = useToolbarControl(mapId.value, props, {
  id: 'mapEventManagementControl',
  getState() {
    return mdiButtonState(path.icon, {
      active: show.value,
      title: trans.value('map.event-control.title'),
    });
  },
  onClick() {
    toggleShow();
  },
});
watch(show, () => control.sync());
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
        :location="panelPosition.location || 'left'"
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
                  { 'is-active': isEventActive(current, event) },
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
                    v-if="isEventActive(current, event)"
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
