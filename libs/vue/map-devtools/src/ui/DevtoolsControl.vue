<script lang="ts">
export default { name: 'devtools-control' };
</script>
<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import { DEVTOOLS_CONTROL } from '@hungpvq/map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import {
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  useMap,
  useMapControl,
  useShow,
  type WithShowProps,
} from '@hungpvq/vue-map-core';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiTools } from '@mdi/js';
import { watch } from 'vue';

import { defineProps, withDefaults } from 'vue';
import { setDevtoolOpen, toggleDevtoolOpen, useDevtoolState } from '../store';
import DevtoolsPanelBody from './DevtoolsPanelBody.vue';

const props = withDefaults(defineProps<WithMapPropType & WithShowProps>(), {
  ...defaultMapProps,
  show: false,
  position: 'bottom-right',
});

const { mapId, order } = useMap(props);
const { isOpen } = useDevtoolState();
const [show, setShow] = useShow(props.show);

watch(
  isOpen,
  (open) => {
    if (show.value !== open) setShow(open);
  },
  { immediate: true },
);

watch(show, (value) => {
  setDevtoolOpen(value);
});

const { panelBind, moduleContainerProps } = useMapControl(mapId, {
  id: DEVTOOLS_CONTROL.id,
  panelKind: 'popup',
  title: () => 'Map Devtools',
  from: props,
  order,
  host: {
    buttonSlot: 'custom',
  },
  show,
  defaultPanelSize: { width: 600, height: 400 },
  setShow: (value) => {
    setShow(value);
    setDevtoolOpen(value);
  },
  actions: [
    {
      type: DEVTOOLS_CONTROL.id,
      run: () => {
        toggleDevtoolOpen();
        setShow(isOpen.value);
      },
    },
  ],
});

function onToggle() {
  toggleDevtoolOpen();
  setShow(isOpen.value);
}

function onUpdateShow(value: boolean) {
  setShow(value);
  setDevtoolOpen(value);
}

function onClose() {
  setShow(false);
  setDevtoolOpen(false);
}
</script>

<template>
  <ModuleContainer v-bind="moduleContainerProps">
    <template #btn>
      <MapControlButton
        variant="icon"
        size="medium"
        :active="isOpen"
        title="Map Devtools"
        aria-label="Map Devtools"
        @click.stop="onToggle"
      >
        <SvgIcon
          :size="20"
          type="mdi"
          :path="mdiTools"
        />
      </MapControlButton>
    </template>
    <template #draggable="bind">
      <DraggableItemPopup
        v-bind="{ ...bind, ...panelBind }"
        :show="isOpen"
        title="Map Devtools"
        @close="onClose"
        @update:show="onUpdateShow"
      >
        <div class="devtools-popup-body">
          <DevtoolsPanelBody />
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>
