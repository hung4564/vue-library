<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import { mdiHome } from '@mdi/js';
import { ref } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import { useLang, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap, type WithMapPropType } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(
  defineProps<
    WithMapPropType & {
      zoom?: number;
      center?: Array<number>;
    }
  >(),
  {
    ...defaultMapProps,
  },
);
const i_center = ref({
  lat: 0,
  lng: 0,
});
const i_zoom = ref(props.zoom || 0);

const { callMap, mapId, moduleContainerProps } = useMap(props, onInit);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
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
const { state, control } = useToolbarControl(mapId.value, props.controlLayout, {
  id: 'mapHomeControl',
  getState() {
    return {
      visible: true,
      title: trans.value('map.home.title'),
      icon: {
        type: 'mdi',
        path: mdiHome,
      },
    };
  },
  onClick() {
    onGoHome();
  },
});
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapCommonButton v-if="state" :option="state" @click="control.onAction">
      </MapCommonButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
