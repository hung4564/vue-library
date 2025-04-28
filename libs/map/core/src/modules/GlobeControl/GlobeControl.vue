<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiWeb } from '@mdi/js';
import { ref } from 'vue';
import MapControlButton from '../../components/MapControlButton.vue';
import { useLang } from '../../extra';
import { useMap, withMapProps } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = defineProps({
  ...withMapProps,
  zoom: Number,
  center: Array<number>,
});
const currentProjection = ref<string | undefined>('mercator');

const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy
);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    'global-control': {
      title: 'Toggle projection',
    },
  },
});
function toggle() {
  callMap((map) => {
    if (currentProjection.value === 'mercator' || !currentProjection.value) {
      map.setProjection({ type: 'globe' });
    } else {
      map.setProjection({ type: 'mercator' });
    }
    currentProjection.value = map.getProjection()?.type as any;
  });
}
let handleMap: any;
function onInit(_map: MapSimple) {
  handleMap = () => {
    currentProjection.value = _map.getProjection()?.type as any;
  };
  _map.on('styledata', handleMap);
}
function onDestroy(_map: MapSimple) {
  if (handleMap) _map.off('styledata', handleMap);
}
</script>
<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        @click.stop="toggle"
        :active="currentProjection === 'globe'"
        :tooltip="trans('map.global-control.title')"
      >
        <SvgIcon :size="18" type="mdi" :path="mdiWeb" />
      </MapControlButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
