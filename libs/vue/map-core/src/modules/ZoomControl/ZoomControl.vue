<script setup lang="ts">
import {
  attachRotateListener,
  MapSimple,
  resetBearing,
  type WithMapPropType,
  zoomIn,
  zoomOut,
} from '@hungpvq/map-core';
import {
  type MapControlButtonUIState,
  mdiButtonState,
} from '@hungpvq/map-core/toolbar';
import { mdiMinus, mdiPlus } from '@mdi/js';
import { computed, ref } from 'vue';

import MapCommonButton from '../../components/MapCommonButton.vue';
import MapControlGroupButton from '../../components/MapControlGroupButton.vue';
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

const {
  moduleContainerProps,
  state: toolbarState,
  control,
} = useMapControl(mapId, {
  id: 'mapNavigationControl',
  panelKind: 'button',
  from: props,
  order,
  buttonSlot: 'custom',
  defaultActionType: 'mapZoomIn',
  getProps: () => ({
    showCompass: props.showCompass,
    showZoom: props.showZoom,
  }),
  actions: [
    { type: 'mapCompass', run: () => onResetBearing() },
    { type: 'mapZoomIn', run: (e) => onZoomIn(e as MouseEvent) },
    { type: 'mapZoomOut', run: (e) => onZoomOut(e as MouseEvent) },
  ],
  toolbar: {
    kind: 'module',
    moduleId: 'mapNavigationControl',
    order: order.value,
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
        getState: () =>
          mdiButtonState(mdiPlus, {
            visible: props.showZoom,
            title: trans.value('map.action.navigation-control-zoom-in'),
          }),
        onClick: (e) => onZoomIn(e),
      },
      {
        id: 'mapZoomOut',
        getState: () =>
          mdiButtonState(mdiMinus, {
            visible: props.showZoom,
            title: trans.value('map.action.navigation-control-zoom-out'),
          }),
        onClick: (e) => onZoomOut(e),
      },
    ],
  },
});
const state = computed(
  () =>
    toolbarState.value as Record<string, MapControlButtonUIState> | undefined,
);
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlGroupButton>
        <MapCommonButton
          v-if="state && state.mapCompass"
          :option="state.mapCompass"
          @click.stop="control.onAction('mapCompass', $event)"
        />
        <MapCommonButton
          v-if="state && state.mapZoomIn"
          :option="state.mapZoomIn"
          @click.stop="control.onAction('mapZoomIn', $event)"
        />
        <MapCommonButton
          v-if="state && state.mapZoomOut"
          :option="state.mapZoomOut"
          @click.stop="control.onAction('mapZoomOut', $event)"
        />
      </MapControlGroupButton>
    </template>
    <slot />
  </ModuleContainer>
</template>
