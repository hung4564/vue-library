<script setup lang="ts">
import {
  attachRotateListener,
  MapSimple,
  resetBearing,
  type WithMapPropType,
  zoomIn,
  zoomOut,
} from '@hungpvq/map-core';
import { mdiButtonState } from '@hungpvq/map-core/toolbar';
import { mdiMinus, mdiPlus } from '@mdi/js';
import { ref } from 'vue';

import { defineProps, withDefaults } from 'vue';
import { useLang } from '../../extra/lang/hook';
import { useMapControl } from '../../extra/registry/useMapControl';
import { defaultMapProps, useMap } from '../../hooks/useMap';
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
const { callMap, mapId, order } = useMap(props, onInit, onDestroy);
const { trans } = useLang(mapId.value);
let detachRotate: (() => void) | null = null;

function onInit(_map: MapSimple) {
  detachRotate = attachRotateListener(_map, (next) => {
    transform.value = next;
    control.sync();
  });
}

function onDestroy(_map: MapSimple) {
  detachRotate?.();
  detachRotate = null;
}

function onZoomIn(e?: MouseEvent) {
  callMap((map) => {
    zoomIn(map, e);
  });
}

function onZoomOut(e?: MouseEvent) {
  callMap((map) => {
    zoomOut(map, e);
  });
}

function onResetBearing() {
  callMap((map) => {
    resetBearing(map);
  });
}

const navigationButtons = [
  {
    id: 'mapCompass',
    getState: () => ({
      visible: props.showCompass,
      title: trans.value('map.action.navigation-control-reset-bearing'),
      icon: {
        type: 'compass' as const,
        transform: transform.value,
      },
    }),
    onClick: () => onResetBearing(),
  },
  {
    id: 'mapZoomIn',
    getState: () =>
      mdiButtonState(mdiPlus, {
        visible: props.showZoom,
        title: trans.value('map.action.navigation-control-zoom-in'),
      }),
    onClick: (e: MouseEvent) => onZoomIn(e),
  },
  {
    id: 'mapZoomOut',
    getState: () =>
      mdiButtonState(mdiMinus, {
        visible: props.showZoom,
        title: trans.value('map.action.navigation-control-zoom-out'),
      }),
    onClick: (e: MouseEvent) => onZoomOut(e),
  },
];

const navigationModule = {
  kind: 'module' as const,
  moduleId: 'mapNavigationControl',
  order: order.value,
  buttons: navigationButtons,
};

const { moduleContainerProps, control } = useMapControl(mapId, {
  id: 'mapNavigationControl',
  panelKind: 'button',
  from: props,
  order,
  host: { button: navigationModule },
  defaultActionType: 'mapZoomIn',
  actions: [
    { type: 'mapCompass', run: () => onResetBearing() },
    { type: 'mapZoomIn', run: (e) => onZoomIn(e as MouseEvent) },
    { type: 'mapZoomOut', run: (e) => onZoomOut(e as MouseEvent) },
  ],
  toolbar: navigationModule,
});
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <slot />
  </ModuleContainer>
</template>
