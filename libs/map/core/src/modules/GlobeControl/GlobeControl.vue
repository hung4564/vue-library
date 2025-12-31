<script setup lang="ts">
import type { MapSimple } from '@hungpvq/shared-map';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiWeb } from '@mdi/js';
import { ref } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import MapControlButton from '../../components/MapControlButton.vue';
import { useLang, useToolbarControl } from '../../extra';
import { defaultMapProps, useMap, type WithMapPropType } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const props = withDefaults(defineProps<WithMapPropType>(), {
  ...defaultMapProps,
});
const currentProjection = ref<string | undefined>('mercator');

const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy,
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
const { state, control } = useToolbarControl(mapId.value, props.controlLayout, {
  id: 'mapGlobeControl',
  getState() {
    return {
      visible: true,
      active: currentProjection.value === 'globe',
      title: trans.value('map.global-control.title'),
      icon: {
        type: 'mdi',
        path: mdiWeb,
      },
    };
  },
  onClick() {
    toggle();
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
