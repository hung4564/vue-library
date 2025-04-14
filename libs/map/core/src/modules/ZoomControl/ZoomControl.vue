<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton>
        <MapControlButton
          v-if="showCompass"
          @click="onResetBearing"
          :title="trans('map.action.navigation-control-reset-bearing')"
        >
          <svg
            height="22"
            :style="{ transform: transform }"
            viewBox="0 0 24 24"
            width="22"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g fill="none" fill-rule="evenodd">
              <path d="M0 0h24v24H0z"></path>
              <path d="M12 3l4 8H8z" fill="#f44336"></path>
              <path d="M12 21l-4-8h8z" fill="#9E9E9E"></path>
            </g>
          </svg>
        </MapControlButton>
        <MapControlButton
          v-if="showZoom"
          @click="onZoomIn"
          :title="trans('map.action.navigation-control-zoom-in')"
        >
          <SvgIcon :size="18" type="mdi" :path="path.plus" />
        </MapControlButton>
        <MapControlButton
          v-if="showZoom"
          @click="onZoomOut"
          :title="trans('map.action.navigation-control-zoom-out')"
        >
          <SvgIcon :size="18" type="mdi" :path="path.minus" />
        </MapControlButton>
      </MapControlGroupButton>
    </template>
    <slot />
  </ModuleContainer>
</template>

<script setup>
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiMinus, mdiPlus } from '@mdi/js';
import { ref } from 'vue';
import MapControlButton from '../../components/MapControlButton.vue';
import MapControlGroupButton from '../../components/MapControlGroupButton.vue';
import { useLang } from '../../extra';
import { useMap, withMapProps } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';
const path = {
  plus: mdiPlus,
  minus: mdiMinus,
};
const props = defineProps({
  ...withMapProps,
  showCompass: { type: Boolean, default: true },
  showZoom: { type: Boolean, default: true },
});
const transform = ref('rotate(0deg)');
const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy
);
const { trans, setLocaleDefault } = useLang(mapId.value);
setLocaleDefault({
  map: {
    action: {
      'navigation-control-zoom-in': 'Zoom in',
      'navigation-control-zoom-out': 'Zoom out',
      'navigation-control-reset-bearing': 'Reset bearing to north',
    },
  },
});
let bindSyncRotate = null;
function onInit(_map) {
  bindSyncRotate = syncRotate.bind(null, _map);
  _map.on('rotate', bindSyncRotate);
}
function onDestroy(_map) {
  _map.off('rotate', bindSyncRotate);
}
function onZoomIn(e) {
  callMap((map) => {
    map.zoomIn({}, { originalEvent: e });
  });
}
function onZoomOut(e) {
  callMap((map) => {
    map.zoomOut({}, { originalEvent: e });
  });
}
function onResetBearing() {
  callMap((map) => {
    map.easeTo({ bearing: 0, pitch: 0 });
  });
}
function syncRotate(_map) {
  const angle = _map.getBearing() * -1;
  transform.value = `rotate(${angle}deg)`;
}
</script>
