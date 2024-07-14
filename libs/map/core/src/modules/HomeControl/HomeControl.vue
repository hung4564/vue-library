<script setup lang="ts">
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiHome } from '@mdi/js';
import { ref } from 'vue';
import MapControlButton from '../../components/MapControlButton.vue';
import { useMap, withMapProps } from '../../hooks';
import { useLang } from '../../extra';
import type { MapSimple } from '@hungpvq/shared-map';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = defineProps({
  ...withMapProps,
  zoom: Number,
  center: Array<number>,
});
const i_center = ref({
  lat: 0,
  lng: 0,
});
const i_zoom = ref(props.zoom || 0);

const { callMap, mapId, moduleContainerProps } = useMap(props, onInit);
const { trans, setLocale } = useLang(mapId.value);
setLocale({
  map: {
    home: {
      title: 'Default view',
    },
  },
});
function onGoHome() {
  callMap((map) => {
    map.setZoom(i_zoom.value);
    map.setCenter(i_center.value);
  });
}
function onInit(_map: MapSimple) {
  if (props.zoom != null) {
    i_zoom.value = props.zoom;
  } else {
    i_zoom.value = _map.getZoom();
  }
  if (props.center != null) {
    i_center.value.lat = props.center[1];
    i_center.value.lng = props.center[0];
  } else {
    i_center.value = _map.getCenter();
  }
}
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton @click="onGoHome" :tooltip="trans('map.home.title')">
        <SvgIcon :size="18" type="mdi" :path="mdiHome" />
      </MapControlButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
