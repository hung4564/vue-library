<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton>
        <template v-if="showCompass">
          <MapCommonButton
            v-if="state && state.mapCompass"
            :option="state.mapCompass"
            @click="navigationModule.onAction('mapCompass', $event)"
          />
        </template>
        <template v-if="showZoom">
          <MapCommonButton
            v-if="state && state.mapZoomIn"
            :option="state.mapZoomIn"
            @click="navigationModule.onAction('mapZoomIn', $event)"
          />
          <MapCommonButton
            v-if="state && state.mapZoomOut"
            :option="state.mapZoomOut"
            @click="navigationModule.onAction('mapZoomOut', $event)"
          />
        </template>
      </MapControlGroupButton>
    </template>
    <slot />
  </ModuleContainer>
</template>

<script setup lang="ts">
import { MapSimple } from '@hungpvq/shared-map';
import { mdiMinus, mdiPlus } from '@mdi/js';
import { ref } from 'vue';
import MapCommonButton from '../../components/MapCommonButton.vue';
import MapControlGroupButton from '../../components/MapControlGroupButton.vue';
import {
  createToolbarModule,
  useLang,
  useMapToolbarModule,
  useToolbarModule,
} from '../../extra';
import { defaultMapProps, useMap, type WithMapPropType } from '../../hooks';
import ModuleContainer from '../ModuleContainer/ModuleContainer.vue';

const props = withDefaults(
  defineProps<
    WithMapPropType & {
      showCompass?: boolean;
      showZoom?: boolean;
    }
  >(),
  {
    ...defaultMapProps,
    showCompass: true,
    showZoom: true,
  },
);

const transform = ref('rotate(0deg)');
const { callMap, mapId, moduleContainerProps } = useMap(
  props,
  onInit,
  onDestroy,
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

let bindSyncRotate: (() => void) | null = null;

function onInit(_map: MapSimple) {
  bindSyncRotate = syncRotate.bind(null, _map);
  _map.on('rotate', bindSyncRotate);
}

function onDestroy(_map: MapSimple) {
  if (bindSyncRotate) {
    _map.off('rotate', bindSyncRotate);
  }
}

function onZoomIn(e: MouseEvent) {
  callMap((map) => {
    map.zoomIn({}, { originalEvent: e });
  });
}

function onZoomOut(e: MouseEvent) {
  callMap((map) => {
    map.zoomOut({}, { originalEvent: e });
  });
}

function onResetBearing() {
  callMap((map) => {
    map.easeTo({ bearing: 0, pitch: 0 });
  });
}

const toolbar = useMapToolbarModule(mapId.value, props.controlLayout);
const navigationModule = createToolbarModule({
  moduleId: 'navigation',
  moduleOrder: 0,
  toolbar,
  buttons: [
    {
      id: 'mapCompass',
      getState: () => ({
        visible: props.showCompass,
        title: trans.value('map.action.navigation-control-reset-bearing'),
        icon: {
          type: 'compass',
          transform: transform.value,
        },
      }),
      onClick: () => onResetBearing(),
    },
    {
      id: 'mapZoomIn',
      getState: () => ({
        visible: props.showZoom,
        title: trans.value('map.action.navigation-control-zoom-in'),
        icon: { path: mdiPlus, type: 'mdi' },
      }),
      onClick: (e) => onZoomIn(e),
    },
    {
      id: 'mapZoomOut',
      getState: () => ({
        visible: props.showZoom,
        title: trans.value('map.action.navigation-control-zoom-out'),
        icon: { path: mdiMinus, type: 'mdi' },
      }),
      onClick: (e) => onZoomOut(e),
    },
  ],
});
function syncRotate(_map: MapSimple) {
  const angle = _map.getBearing() * -1;
  transform.value = `rotate(${angle}deg)`;
  navigationModule.sync();
}

const { state } = useToolbarModule(navigationModule);
</script>
