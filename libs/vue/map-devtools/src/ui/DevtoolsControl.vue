<script lang="ts">
export default { name: 'devtools-control' };
</script>
<script setup lang="ts">
import type { WithMapPropType } from '@hungpvq/map-core';
import {
  defaultMapProps,
  MapControlButton,
  ModuleContainer,
  useMap,
  useRegisterMapControl,
  useShow,
  type WithShowProps,
} from '@hungpvq/vue-map-core';
import { DraggableItemPopup } from '@hungpvq/vue-draggable';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiTools } from '@mdi/js';
import { watch } from 'vue';
import { DEVTOOLS_CONTROL } from '../control';
import {
  setDevtoolOpen,
  toggleDevtoolOpen,
  useDevtoolState,
} from '../store';
import DevtoolsPanelBody from './DevtoolsPanelBody.vue';

const props = withDefaults(
  defineProps<WithMapPropType & WithShowProps>(),
  {
    ...defaultMapProps,
    show: false,
    position: 'bottom-right',
  },
);

const { mapId, moduleContainerProps } = useMap(props);
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

const { panelBind } = useRegisterMapControl(mapId, {
  id: DEVTOOLS_CONTROL.id,
  panelKind: 'popup',
  title: () => 'Map Devtools',
  buttonPosition: () => props.position,
  show,
  setShow: (value) => {
    setShow(value);
    setDevtoolOpen(value);
  },
  getProps: () => ({
    position: props.position,
    controlLayout: props.controlLayout,
  }),
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
        <SvgIcon :size="20" type="mdi" :path="mdiTools" />
      </MapControlButton>
    </template>
    <template #draggable="bind">
      <DraggableItemPopup
        v-bind="{ ...bind, ...panelBind }"
        :show="isOpen"
        :width="600"
        :height="400"
        title="Map Devtools"
        @close="onClose"
        @update:show="onUpdateShow"
      >
        <template #title>Map Devtools</template>
        <div class="devtools-popup-body">
          <DevtoolsPanelBody />
        </div>
      </DraggableItemPopup>
    </template>
  </ModuleContainer>
</template>

<style scoped>
.devtools-popup-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
</style>
